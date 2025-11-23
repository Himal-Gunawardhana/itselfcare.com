import { Link } from "react-router-dom";
import { Star, MapPin, Languages, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTherapists } from "@/data/mockData";

export default function DemoEChanneling() {
  // Sort by rating to show top therapists
  const topTherapists = [...mockTherapists]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              E-Channeling Platform Demo
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Explore our physiotherapy booking system with sample data
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/echanneling/register">
                <Button size="lg" variant="secondary">
                  Register Now
                </Button>
              </Link>
              <Link to="/echanneling/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white text-white hover:bg-white/20"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-yellow-800">
            <strong>📌 Demo Mode:</strong> This page uses sample data. To
            connect to AWS backend, configure credentials in{" "}
            <code className="bg-yellow-100 px-2 py-1 rounded">
              AWS_CREDENTIALS_SETUP.md
            </code>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-blue-600">
                {mockTherapists.length}
              </CardTitle>
              <CardDescription>Certified Therapists</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-blue-600">
                {mockTherapists.reduce((sum, t) => sum + t.totalReviews, 0)}
              </CardTitle>
              <CardDescription>Patient Reviews</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-blue-600">
                {(
                  mockTherapists.reduce((sum, t) => sum + t.averageRating, 0) /
                  mockTherapists.length
                ).toFixed(1)}{" "}
                ⭐
              </CardTitle>
              <CardDescription>Average Rating</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Top Therapists */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Our Top-Rated Therapists
            </h2>
            <p className="text-gray-600">
              Expert physiotherapists ready to help you recover and thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTherapists.map((therapist) => (
              <Card
                key={therapist.theraphistId}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {therapist.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {therapist.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({therapist.totalReviews} reviews)
                        </span>
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      ${therapist.hourlyRate}/hr
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bio */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {therapist.bio}
                  </p>

                  {/* Specialties */}
                  <div>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                      <Award className="h-4 w-4" />
                      <span>Specialties</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialties
                        .slice(0, 2)
                        .map((specialty, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      {therapist.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{therapist.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Languages className="h-4 w-4" />
                      <span>{therapist.languages.join(", ")}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Colombo, Sri Lanka</span>
                  </div>

                  {/* Action */}
                  <Link to="/echanneling/find-therapist">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Clock className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Why Choose ItselfCare?</h2>
            <p className="text-blue-100">
              Modern healthcare at your fingertips
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
              <p className="text-blue-100 text-sm">
                Book appointments instantly with our simple scheduling system
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Certified Experts</h3>
              <p className="text-blue-100 text-sm">
                All therapists are highly qualified and experienced
                professionals
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nearby Location</h3>
              <p className="text-blue-100 text-sm">
                Find therapists near you with our geolocation-based search
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Recovery Journey?
          </h2>
          <div className="flex justify-center gap-4">
            <Link to="/echanneling/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Create Account
              </Button>
            </Link>
            <Link to="/echanneling/find-therapist">
              <Button size="lg" variant="outline">
                Browse Therapists
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
