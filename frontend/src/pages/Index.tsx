import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Stethoscope,
  Users,
  MessageCircle,
  Shield,
  Brain,
  FileText,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="Logo" className="h-11 w-15" />
              <h1 className="text-2xl font-bold text-gray-900">
                Doctor AI Chat
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/doctor-signup">
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Register as Doctor
                </Button>
              </Link>
              <Link to="/admin-signup">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-600 hover:bg-gray-50"
                >
                  Register as Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Doctor-Patient Communication Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with patients through secure chat while leveraging AI
            assistance for preliminary insights and medical terminology support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Stethoscope className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <CardTitle>Doctor Login</CardTitle>
                <CardDescription>
                  Access your dashboard to manage patients and consultations.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Login as Doctor
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-gray-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-gray-600 mb-4 mx-auto" />
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Manage doctor accounts and platform settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/admin-login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-gray-600 hover:bg-gray-50"
                  >
                    Login as Admin
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Real-time Chat</CardTitle>
              <CardDescription>
                Secure, instant messaging between doctors and patients with chat
                history tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Preliminary symptom analysis and medical terminology support to
                assist healthcare decisions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Doctor Management</CardTitle>
              <CardDescription>
                Comprehensive admin dashboard for managing doctor registrations
                and account approvals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Secure Platform</CardTitle>
              <CardDescription>
                HIPAA-compliant security measures to protect sensitive medical
                communications.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Upload and manage PDF documents, guidelines, and medical forms
                for easy access.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Stethoscope className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Professional Profiles</CardTitle>
              <CardDescription>
                Detailed doctor profiles with qualifications, specializations,
                and professional bios.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Important Disclaimer */}
        <Card className="bg-yellow-50 border-yellow-200 mb-8">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              Important Disclaimer
            </CardTitle>
            <CardContent className="pt-0">
              <p className="text-yellow-700">
                This AI assistant is designed to support healthcare
                professionals and does not provide diagnoses or medical advice.
                All medical decisions should be made by qualified healthcare
                professionals. This platform is intended to assist in
                preliminary analysis and terminology support only.
              </p>
            </CardContent>
          </CardHeader>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Doctor AI Chat. All rights reserved.</p>
          <p className="text-gray-400 mt-2">
            Empowering healthcare through AI-assisted communication
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
