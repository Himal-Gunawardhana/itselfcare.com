import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Play,
  Pause,
  FileJson,
  CheckCircle,
  AlertTriangle,
  X,
  Timer,
  Target,
  Activity,
  Zap,
} from "lucide-react";
import { ArmatureControls } from "./Demo3DCanvas";

// ✅ TypeScript interfaces for AI exercise data - UPDATED
export interface AIExerciseItem {
  exercise: string;
  intensity: "LOW" | "MEDIUM" | "HIGH" | "MED"; // ✅ Added MED for compatibility
  duration_min: number;
  rest_min: number;
  pressure_percentage: number;
  cadence_rpm: number;
  repetitions: number;
}

export interface AIExerciseProgram {
  run_id: string;
  patient_id: string;
  recommended: {
    schedule: AIExerciseItem[];
    score: number;
  };
  shortlist_count: number;
  exploration_count: number;
}

interface AIModeProps {
  isOpen: boolean;
  onClose: () => void;
  armatureRef: React.RefObject<ArmatureControls>;
}

// ✅ Map AI exercise names to existing canvas exercise types - UPDATED
const mapAIExerciseToCanvasType = (aiExercise: string): string => {
  const mapping: { [key: string]: string } = {
    FINGER_GRIP: "grip",
    WRIST_SUP_PRO: "wrist",
    ELBOW_FLEX_EXT: "bend",
    SHOULDER_FLEX: "full",
    WRIST_FLEX_EXT: "wrist",
    COMBO_LIGHT: "full", // ✅ Map COMBO_LIGHT to full range motion
  };
  return mapping[aiExercise] || "bend"; // Default fallback
};

// ✅ Sample AI exercise data - USING YOUR ACTUAL FORMAT
const SAMPLE_AI_DATA: AIExerciseProgram = {
  run_id: "2bab40c3c3034b2594e51226b71ef1ef",
  patient_id: "P001",
  recommended: {
    schedule: [
      {
        exercise: "COMBO_LIGHT",
        intensity: "HIGH",
        duration_min: 0.33, // ✅ 20 seconds for demo (20/60 = 0.33)
        rest_min: 0.17, // ✅ 10 seconds rest (10/60 = 0.17)
        pressure_percentage: 90,
        cadence_rpm: 5,
        repetitions: 35,
      },
      {
        exercise: "WRIST_SUP_PRO",
        intensity: "HIGH",
        duration_min: 0.42, // ✅ 25 seconds for demo
        rest_min: 0.03, // ✅ 2 seconds rest
        pressure_percentage: 90,
        cadence_rpm: 6,
        repetitions: 24,
      },
      {
        exercise: "WRIST_SUP_PRO",
        intensity: "MED",
        duration_min: 0.33, // ✅ 20 seconds for demo
        rest_min: 0.03, // ✅ 2 seconds rest
        pressure_percentage: 75,
        cadence_rpm: 6,
        repetitions: 9,
      },
      {
        exercise: "COMBO_LIGHT",
        intensity: "MED",
        duration_min: 0.17, // ✅ 10 seconds for demo
        rest_min: 0.17, // ✅ 10 seconds rest
        pressure_percentage: 75,
        cadence_rpm: 5,
        repetitions: 42,
      },
      {
        exercise: "COMBO_LIGHT",
        intensity: "HIGH",
        duration_min: 0.25, // ✅ 15 seconds for demo
        rest_min: 0.03, // ✅ 2 seconds rest
        pressure_percentage: 90,
        cadence_rpm: 5,
        repetitions: 31,
      },
      {
        exercise: "ELBOW_FLEX_EXT",
        intensity: "HIGH",
        duration_min: 0.33, // ✅ 20 seconds for demo
        rest_min: 0.13, // ✅ 8 seconds rest
        pressure_percentage: 90,
        cadence_rpm: 4,
        repetitions: 46,
      },
    ],
    score: 0.3794375065469784,
  },
  shortlist_count: 3,
  exploration_count: 8,
};

const AIMode: React.FC<AIModeProps> = ({ isOpen, onClose, armatureRef }) => {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedData, setParsedData] = useState<AIExerciseProgram | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reference to track if program should stop
  const programRunningRef = useRef(false);

  // ✅ Validate AI exercise JSON - UPDATED
  const validateAIData = (data: unknown): data is AIExerciseProgram => {
    const typedData = data as Record<string, unknown>;
    if (!typedData.run_id || !typedData.patient_id) {
      throw new Error("Missing run_id or patient_id");
    }
    if (
      !typedData.recommended ||
      typeof typedData.recommended !== "object" ||
      typedData.recommended === null
    ) {
      throw new Error("Missing recommended object");
    }
    const recommended = typedData.recommended as Record<string, unknown>;
    if (!recommended.schedule) {
      throw new Error("Missing recommended.schedule");
    }
    if (
      !Array.isArray(recommended.schedule) ||
      recommended.schedule.length === 0
    ) {
      throw new Error("Schedule must be a non-empty array");
    }

    // Validate each exercise
    (recommended.schedule as AIExerciseItem[]).forEach(
      (exercise: AIExerciseItem, index: number) => {
        if (!exercise.exercise || typeof exercise.exercise !== "string") {
          throw new Error(`Exercise ${index + 1}: Missing exercise name`);
        }
        // ✅ Updated intensity validation to include MED
        if (!["LOW", "MEDIUM", "HIGH", "MED"].includes(exercise.intensity)) {
          throw new Error(
            `Exercise ${
              index + 1
            }: Invalid intensity (must be LOW, MEDIUM, HIGH, or MED)`
          );
        }
        if (
          typeof exercise.duration_min !== "number" ||
          exercise.duration_min <= 0
        ) {
          throw new Error(`Exercise ${index + 1}: Invalid duration_min`);
        }
        if (
          typeof exercise.repetitions !== "number" ||
          exercise.repetitions <= 0
        ) {
          throw new Error(`Exercise ${index + 1}: Invalid repetitions`);
        }
      }
    );

    return true;
  };

  // ✅ Handle JSON input change
  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    setValidationError(null);
    setParsedData(null);

    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (validateAIData(parsed)) {
          setParsedData(parsed);
          console.log("✅ Valid AI exercise data loaded");
        }
      } catch (error) {
        // Don't show errors while typing
      }
    }
  };

  // ✅ Load sample data
  const loadSampleData = () => {
    const sampleJson = JSON.stringify(SAMPLE_AI_DATA, null, 2);
    setJsonInput(sampleJson);
    setParsedData(SAMPLE_AI_DATA);
    setValidationError(null);
  };

  // ✅ Execute a single exercise and wait for completion
  const executeExerciseBlock = async (
    exercise: AIExerciseItem,
    exerciseNumber: number,
    totalExercises: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      console.log(
        `\n🎯 Starting Exercise ${exerciseNumber}/${totalExercises}: ${exercise.exercise}`
      );
      console.log(`   Intensity: ${exercise.intensity}`);
      console.log(
        `   Duration: ${exercise.duration_min} min (${
          exercise.duration_min * 60
        } seconds)`
      );
      console.log(`   Repetitions: ${exercise.repetitions}`);
      console.log(`   Pressure: ${exercise.pressure_percentage}%`);
      console.log(`   Cadence: ${exercise.cadence_rpm} RPM`);

      // Map AI exercise to canvas type
      const canvasExerciseType = mapAIExerciseToCanvasType(exercise.exercise);
      console.log(`   🎮 Canvas exercise type: ${canvasExerciseType}`);

      // Calculate exercise duration in milliseconds
      const exerciseDurationMs = exercise.duration_min * 60 * 1000;

      // ✅ Start the exercise animation on RehabX.glb model
      console.log(
        `   🚀 Starting ${canvasExerciseType} animation for ${exerciseDurationMs}ms`
      );
      armatureRef.current?.performExercise(
        canvasExerciseType,
        exerciseDurationMs,
        exercise.repetitions
      );

      // ✅ Wait for the FULL exercise duration to complete
      setTimeout(() => {
        console.log(
          `   ✅ Exercise ${exerciseNumber} completed after ${exercise.duration_min} minutes`
        );
        resolve();
      }, exerciseDurationMs);
    });
  };

  // ✅ Execute rest period between exercises
  const executeRestPeriod = async (restMinutes: number): Promise<void> => {
    return new Promise((resolve) => {
      const restDurationMs = restMinutes * 60 * 1000;
      console.log(`   💤 Resting for ${restMinutes} min (${restDurationMs}ms)`);

      // Reset pose during rest
      armatureRef.current?.resetPose();
      console.log(`   🔄 Pose reset during rest period`);

      setTimeout(() => {
        console.log(`   ⏰ Rest period completed`);
        resolve();
      }, restDurationMs);
    });
  };

  // ✅ Start AI exercise program - SEQUENTIAL EXECUTION
  const startAIProgram = async (programData: AIExerciseProgram) => {
    programRunningRef.current = true;

    console.log("\n" + "=".repeat(60));
    console.log("🤖 STARTING AI EXERCISE PROGRAM - SEQUENTIAL EXECUTION");
    console.log("=".repeat(60));
    console.log(`   Patient: ${programData.patient_id}`);
    console.log(`   Run ID: ${programData.run_id}`);
    console.log(
      `   Total exercises: ${programData.recommended.schedule.length}`
    );
    console.log(
      `   AI Score: ${(programData.recommended.score * 100).toFixed(1)}%`
    );
    console.log("=".repeat(60));

    try {
      const exercises = programData.recommended.schedule;

      // ✅ Execute each exercise SEQUENTIALLY
      for (let i = 0; i < exercises.length; i++) {
        // Check if program should stop
        if (!programRunningRef.current) {
          console.log("⏹️ Program stopped by user");
          break;
        }

        const exercise = exercises[i];
        const exerciseNumber = i + 1;

        // ✅ Execute the exercise block and wait for completion
        await executeExerciseBlock(exercise, exerciseNumber, exercises.length);

        // ✅ Execute rest period if not the last exercise
        if (i < exercises.length - 1 && exercise.rest_min > 0) {
          await executeRestPeriod(exercise.rest_min);
        }

        console.log(
          `   📊 Progress: ${exerciseNumber}/${exercises.length} exercises completed`
        );
      }

      if (programRunningRef.current) {
        console.log("\n" + "=".repeat(60));
        console.log("🎉 AI EXERCISE PROGRAM COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(60));

        // Final reset after all exercises
        setTimeout(() => {
          armatureRef.current?.resetPose();
          console.log("🔄 Final pose reset completed");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ AI Program execution error:", error);
    } finally {
      programRunningRef.current = false;
    }
  };

  // ✅ Submit and validate - CLOSES MODAL AND STARTS BACKGROUND EXECUTION
  const handleSubmit = () => {
    if (!jsonInput.trim()) {
      setValidationError("Please enter AI exercise data");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      if (validateAIData(parsed)) {
        setParsedData(parsed);
        setValidationError(null);

        console.log(
          "🚀 Closing AI Exercise Mode modal and starting sequential demonstration..."
        );

        // ✅ CLOSE THE MODAL IMMEDIATELY
        onClose();

        // ✅ START THE AI PROGRAM IN BACKGROUND (after modal closes)
        setTimeout(() => {
          startAIProgram(parsed);
        }, 500); // Small delay to ensure modal is closed
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid JSON format";
      setValidationError(errorMessage);
      console.error("❌ Validation failed:", errorMessage);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setJsonInput("");
    setParsedData(null);
    setValidationError(null);
    programRunningRef.current = false;
  };

  // ✅ Close dialog
  const handleClose = () => {
    programRunningRef.current = false;
    resetForm();
    onClose();
  };

  // ✅ Get exercise display name - UPDATED
  const getExerciseDisplayName = (exercise: string) => {
    const names: { [key: string]: string } = {
      FINGER_GRIP: "Finger Grip",
      WRIST_SUP_PRO: "Wrist Rotation",
      ELBOW_FLEX_EXT: "Elbow Flexion",
      SHOULDER_FLEX: "Shoulder Flex",
      WRIST_FLEX_EXT: "Wrist Flexion",
      COMBO_LIGHT: "Combo Light", // ✅ Added COMBO_LIGHT
    };
    return names[exercise] || exercise;
  };

  // ✅ Get intensity badge color - UPDATED
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      case "MEDIUM":
      case "MED": // ✅ Handle both MEDIUM and MED
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Brain className="mr-3 h-6 w-6 text-primary" />
            AI Exercise Mode
            <Badge variant="secondary" className="ml-3">
              Sequential Execution
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - JSON Input */}
          <div className="col-span-7 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileJson className="mr-2 h-5 w-5" />
                    Exercise Program Input
                  </div>
                  <Button size="sm" variant="outline" onClick={loadSampleData}>
                    Load Sample
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* JSON Input Area */}
                <div>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonInputChange(e.target.value)}
                    placeholder="Paste your AI exercise program JSON here..."
                    className="font-mono text-sm min-h-[300px] resize-none"
                  />
                </div>

                {/* Validation Messages */}
                {validationError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-center text-destructive text-sm">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      <strong>Validation Error:</strong>
                    </div>
                    <p className="text-destructive text-sm mt-1">
                      {validationError}
                    </p>
                  </div>
                )}

                {parsedData && !validationError && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center text-green-700 text-sm">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <strong>✅ Valid AI Exercise Program Loaded</strong>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      Ready to demonstrate{" "}
                      {parsedData.recommended.schedule.length} exercises for
                      patient {parsedData.patient_id}
                    </p>
                    <p className="text-blue-600 text-sm mt-1 font-medium">
                      ⚡ Exercises will run sequentially - one at a time,
                      waiting for each to complete
                    </p>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!parsedData || !!validationError}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Sequential Demo
                  </Button>

                  <Button onClick={resetForm} variant="outline" size="lg">
                    <X className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>

                {/* Instructions - UPDATED */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-blue-800 text-sm">
                    <strong>📋 Supported Exercises:</strong>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>
                        <code>COMBO_LIGHT</code> → Full Range Motion
                      </li>
                      <li>
                        <code>WRIST_SUP_PRO</code> → Wrist Rotation
                      </li>
                      <li>
                        <code>ELBOW_FLEX_EXT</code> → Elbow Flexion
                      </li>
                      <li>
                        <code>FINGER_GRIP</code> → Finger Grip
                      </li>
                    </ul>
                    <strong className="block mt-2">Intensities:</strong>
                    <span className="text-xs">LOW, MED/MEDIUM, HIGH</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Program Preview */}
          <div className="col-span-5 space-y-4">
            {/* Program Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Sequential Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parsedData ? (
                  <div className="space-y-4">
                    {/* Patient & Run Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <strong>Patient ID:</strong>
                        <p className="font-mono text-xs">
                          {parsedData.patient_id}
                        </p>
                      </div>
                      <div>
                        <strong>Run ID:</strong>
                        <p className="font-mono text-xs">
                          {parsedData.run_id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>

                    {/* AI Score */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <strong>AI Score:</strong>
                        <span>
                          {(parsedData.recommended.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={parsedData.recommended.score * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Program Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <strong>Total Exercises:</strong>{" "}
                        {parsedData.recommended.schedule.length}
                      </div>
                      <div>
                        <strong>Execution:</strong> Sequential
                      </div>
                    </div>

                    {/* Exercise Schedule with Sequential Indicators */}
                    <div>
                      <strong className="text-sm">Execution Order:</strong>
                      <div className="space-y-2 max-h-48 overflow-y-auto mt-2">
                        {parsedData.recommended.schedule.map(
                          (exercise, index) => (
                            <div key={index}>
                              <div className="p-2 border rounded-md bg-background">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full mr-2">
                                      {index + 1}
                                    </span>
                                    {getExerciseDisplayName(exercise.exercise)}
                                  </span>
                                  <Badge
                                    className={`text-xs border ${getIntensityColor(
                                      exercise.intensity
                                    )}`}
                                  >
                                    {exercise.intensity}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Timer className="mr-1 h-3 w-3" />
                                    {exercise.duration_min}min
                                  </div>
                                  <div className="flex items-center">
                                    <Target className="mr-1 h-3 w-3" />
                                    {exercise.repetitions} reps
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Pressure: {exercise.pressure_percentage}% •
                                  RPM: {exercise.cadence_rpm}
                                </div>
                              </div>

                              {/* Rest Period Indicator */}
                              {index <
                                parsedData.recommended.schedule.length - 1 &&
                                exercise.rest_min > 0 && (
                                  <div className="flex items-center justify-center py-1">
                                    <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                                      ⏸️ Rest {exercise.rest_min}min → Reset
                                      Pose
                                    </div>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Brain className="mx-auto h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm">
                      Load AI exercise data to see the sequential execution plan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIMode;
