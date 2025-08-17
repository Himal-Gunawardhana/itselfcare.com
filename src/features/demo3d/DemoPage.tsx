import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import Demo3DCanvas, { ArmatureControls } from "./Demo3DCanvas";
import {
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Activity,
  Timer,
  Gauge,
  AlertTriangle,
} from "lucide-react";

const EXERCISE_TYPES = [
  { name: "Arm Flexion", key: "bend", duration: 30 },
  { name: "Wrist Rotation", key: "wrist", duration: 25 },
  { name: "Finger Grip", key: "grip", duration: 20 },
  { name: "Full Range", key: "full", duration: 45 },
];

// Simplified body parts - one control per finger/joint
const BODY_PART_LIMITS = {
  // Elbow
  ForeArm: {
    axis: "z" as const,
    initial: 0, // Starting position
    normal: -45, // Normal/rest position
    final: -120, // Maximum flexion
    label: "Elbow",
  },

  // Wrist
  Wrist: {
    axis: "z" as const,
    initial: 0, // Neutral
    normal: -20, // Slight flexion
    final: -70, // Full flexion
    label: "Wrist",
  },

  // Index finger (controls all joints together)
  IndexFinger: {
    axis: "z" as const,
    initial: 0, // Extended
    normal: -30, // Slightly curved
    final: -90, // Full fist
    label: "Index Finger",
    bones: ["Index0", "Index1", "Index2"], // All joints move together
  },

  // Middle finger
  MiddleFinger: {
    axis: "z" as const,
    initial: 0,
    normal: -30,
    final: -90,
    label: "Middle Finger",
    bones: ["Middle0", "Middle1", "Middle2"],
  },

  // Ring finger
  RingFinger: {
    axis: "z" as const,
    initial: 0,
    normal: -30,
    final: -90,
    label: "Ring Finger",
    bones: ["Ring0", "Ring1", "Ring2"],
  },

  // Pinky finger
  PinkyFinger: {
    axis: "z" as const,
    initial: 0,
    normal: -30,
    final: -90,
    label: "Pinky Finger",
    bones: ["Pinky0", "Pinky1", "Pinky2"],
  },

  // Thumb
  Thumb: {
    axis: "z" as const,
    initial: 0,
    normal: -20,
    final: -60,
    label: "Thumb",
    bones: ["Thumb0", "Thumb1", "Thumb2"],
  },
};

const CONTROLLABLE_BONES = Object.keys(BODY_PART_LIMITS);

const DemoPage = () => {
  const armatureRef = useRef<ArmatureControls>(null);
  const [selectedBone, setSelectedBone] = useState("ForeArm");
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isExercising, setIsExercising] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(EXERCISE_TYPES[0]);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [pneumaticPressure, setPneumaticPressure] = useState(85);

  // Timer for session
  useEffect(() => {
    const timer = setInterval(() => {
      if (isExercising) {
        setSessionTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isExercising]);

  // Exercise progress simulation
  useEffect(() => {
    if (isExercising) {
      const progressTimer = setInterval(() => {
        setExerciseProgress((prev) => {
          if (prev >= 100) {
            setRepetitions((reps) => reps + 1);
            return 0;
          }
          return prev + 100 / currentExercise.duration;
        });
      }, 1000);
      return () => clearInterval(progressTimer);
    }
  }, [isExercising, currentExercise]);

  const handleRotationChange = (value: number[]) => {
    const angle = value[0];
    setCurrentRotation(angle);

    const boneConfig =
      BODY_PART_LIMITS[selectedBone as keyof typeof BODY_PART_LIMITS];
    if (boneConfig) {
      if ("bones" in boneConfig && boneConfig.bones) {
        // Move multiple bones (for fingers)
        boneConfig.bones.forEach((boneName) => {
          armatureRef.current?.rotateBone(boneName, boneConfig.axis, angle);
        });
      } else {
        // Move single bone (for elbow/wrist)
        armatureRef.current?.rotateBone(selectedBone, boneConfig.axis, angle);
      }
    }
  };

  const resetPose = () => {
    armatureRef.current?.resetPose();
    setCurrentRotation(0);
  };

  const getCurrentBoneConfig = () => {
    return BODY_PART_LIMITS[selectedBone as keyof typeof BODY_PART_LIMITS];
  };

  const setPresetPosition = (position: "initial" | "normal" | "final") => {
    const config = getCurrentBoneConfig();
    if (config) {
      const angle = config[position];
      handleRotationChange([angle]);
    }
  };

  const startExercise = () => {
    setIsExercising(true);
    setExerciseProgress(0);
    armatureRef.current?.performExercise(currentExercise.key);
  };

  const stopExercise = () => {
    setIsExercising(false);
    setExerciseProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-gradient-subtle pt-16 overflow-hidden">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold">
            Interactive <span className="text-primary">RehabX Demo</span>
          </h1>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Left Controls - Compact */}
          <div className="col-span-3 space-y-3 overflow-y-auto">
            {/* Manual Controls */}
            <Card className="p-3">
              <h3 className="font-medium mb-2 text-sm">Manual Controls</h3>

              <div className="space-y-3">
                {/* Body Part Selection */}
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Body Part
                  </label>
                  <select
                    value={selectedBone}
                    onChange={(e) => {
                      setSelectedBone(e.target.value);
                      setCurrentRotation(0);
                    }}
                    className="w-full p-1 text-xs border rounded"
                  >
                    {CONTROLLABLE_BONES.map((bone) => {
                      const config =
                        BODY_PART_LIMITS[bone as keyof typeof BODY_PART_LIMITS];
                      return (
                        <option key={bone} value={bone}>
                          {config.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Single Rotation Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium">
                      {getCurrentBoneConfig()?.label}
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {getCurrentBoneConfig()?.axis.toUpperCase()}-axis
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Slider
                      value={[currentRotation]}
                      onValueChange={handleRotationChange}
                      min={getCurrentBoneConfig()?.final || -90} // Final is usually the minimum
                      max={getCurrentBoneConfig()?.initial || 0} // Initial is usually the maximum
                      step={1}
                      className="w-full"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{getCurrentBoneConfig()?.final}° (Final)</span>
                      <span className="font-medium">{currentRotation}°</span>
                      <span>{getCurrentBoneConfig()?.initial}° (Initial)</span>
                    </div>
                  </div>
                </div>

                {/* Preset Positions */}
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPresetPosition("initial")}
                    className="text-xs"
                  >
                    Initial
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPresetPosition("normal")}
                    className="text-xs"
                  >
                    Normal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPresetPosition("final")}
                    className="text-xs"
                  >
                    Final
                  </Button>
                </div>
              </div>

              <Button
                onClick={resetPose}
                variant="outline"
                size="sm"
                className="w-full mt-3"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset All
              </Button>
            </Card>

            {/* Exercise Controls */}
            <Card className="p-3">
              <h3 className="font-medium mb-2 text-sm">Exercise Programs</h3>

              <div className="space-y-1">
                {EXERCISE_TYPES.map((exercise) => (
                  <Button
                    key={exercise.key}
                    variant={
                      currentExercise.key === exercise.key
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentExercise(exercise)}
                  >
                    {exercise.name}
                  </Button>
                ))}
              </div>

              <div className="flex gap-1 mt-2">
                <Button
                  onClick={startExercise}
                  disabled={isExercising}
                  size="sm"
                  className="flex-1"
                >
                  <Play className="mr-1 h-3 w-3" />
                  Start
                </Button>
                <Button
                  onClick={stopExercise}
                  variant="outline"
                  disabled={!isExercising}
                  size="sm"
                  className="flex-1"
                >
                  <Pause className="mr-1 h-3 w-3" />
                  Stop
                </Button>
              </div>
            </Card>

            {/* Safety Controls */}
            <Card className="p-3">
              <h3 className="font-medium mb-2 text-sm">Safety</h3>
              <Button variant="destructive" size="sm" className="w-full mb-1">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Emergency-Stop
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Auto Mode
              </Button>
            </Card>
          </div>

          {/* 3D Canvas - Center */}
          <div className="col-span-6 flex flex-col">
            <Demo3DCanvas
              ref={armatureRef}
              className="flex-1 border-2 border-primary/20"
            />
          </div>

          {/* Right Controls */}
          <div className="col-span-3 space-y-3">
            {/* Quick Actions */}
            <Card className="p-3">
              <h3 className="font-medium mb-2 text-sm">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-1">
                <Button size="sm" variant="outline">
                  <SkipBack className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <SkipForward className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            {/* Live Stats - Compact */}
            <Card className="p-3">
              <h3 className="font-medium mb-2 text-sm">Live Stats</h3>
              <div className="space-y-3">
                {/* Exercise Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">Progress</span>
                    <span className="text-xs">
                      {Math.round(exerciseProgress)}%
                    </span>
                  </div>
                  <Progress value={exerciseProgress} className="h-2" />
                </div>

                {/* Repetitions */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {repetitions}
                  </div>
                  <div className="text-xs text-muted-foreground">Reps</div>
                </div>

                {/* Session Time */}
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">
                    {formatTime(sessionTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Session Time
                  </div>
                </div>

                {/* Pneumatic Status */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Gauge className="h-3 w-3 text-primary" />
                    <span className="text-xs">Pressure</span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {pneumaticPressure}%
                  </div>
                </div>
              </div>
            </Card>

            {/* Current Exercise Info */}
            <Card className="p-3">
              <h3 className="font-medium mb-2 text-sm">Current Exercise</h3>
              <div className="text-center">
                <div className="text-sm font-medium text-primary">
                  {currentExercise.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Duration: {currentExercise.duration}s
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isExercising ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {isExercising ? "Running" : "Stopped"}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Status Bar - Very Compact */}
        <div className="mt-2 py-2 border-t bg-background/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Device Status: Connected</span>
            <span>Current Exercise: {currentExercise.name}</span>
            <span>Safety: Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
