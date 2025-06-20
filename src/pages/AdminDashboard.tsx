import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Shield,
  Stethoscope,
  Eye,
  Download,
  MessageSquare,
  TrendingUp,
  Star,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  registrationDate: Date;
  status: "pending" | "approved" | "rejected";
}

interface Document {
  id: string;
  name: string;
  uploadDate: Date;
  size: string;
  type: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Mock data for doctors
    const mockDoctors: Doctor[] = [
      {
        id: "1",
        name: "Dr. John Smith",
        email: "john.smith@hospital.com",
        specialty: "Cardiology",
        registrationDate: new Date(2024, 0, 15),
        status: "pending",
      },
      {
        id: "2",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@clinic.com",
        specialty: "Pediatrics",
        registrationDate: new Date(2024, 0, 20),
        status: "approved",
      },
      {
        id: "3",
        name: "Dr. Michael Brown",
        email: "michael.brown@medical.com",
        specialty: "Neurology",
        registrationDate: new Date(2024, 1, 5),
        status: "pending",
      },
    ];

    const mockDocuments: Document[] = [
      {
        id: "1",
        name: "Medical Guidelines 2024",
        uploadDate: new Date(2024, 0, 10),
        size: "2.5 MB",
        type: "PDF",
      },
      {
        id: "2",
        name: "Treatment Protocols",
        uploadDate: new Date(2024, 0, 12),
        size: "1.8 MB",
        type: "PDF",
      },
    ];

    setDoctors(mockDoctors);
    setDocuments(mockDocuments);
  }, []);

  const handleDoctorAction = (
    doctorId: string,
    action: "approve" | "reject"
  ) => {
    setDoctors((prev) =>
      prev.map((doctor) =>
        doctor.id === doctorId
          ? {
              ...doctor,
              status: action === "approve" ? "approved" : "rejected",
            }
          : doctor
      )
    );

    const actionText = action === "approve" ? "approved" : "rejected";
    toast({
      title: `Doctor ${actionText}`,
      description: `Doctor account has been ${actionText} successfully.`,
    });
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Mock file upload
    const newDocument: Document = {
      id: Date.now().toString(),
      name: selectedFile.name,
      uploadDate: new Date(),
      size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
      type: "PDF",
    };

    setDocuments((prev) => [...prev, newDocument]);
    setSelectedFile(null);

    toast({
      title: "File uploaded",
      description: `${selectedFile.name} has been uploaded successfully.`,
    });
  };

  const getStatusBadge = (status: Doctor["status"]) => {
    const variants = {
      pending: "default" as const,
      approved: "default" as const,
      rejected: "destructive" as const,
    };

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    totalDoctors: doctors.length,
    pendingApprovals: doctors.filter((d) => d.status === "pending").length,
    approvedDoctors: doctors.filter((d) => d.status === "approved").length,
    totalDocuments: documents.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">Doctor AI Chat Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => {
                  /* Implement logout logic here */
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Doctors
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalDoctors}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Approvals
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pendingApprovals}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Approved Doctors
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.approvedDoctors}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalDocuments}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Admin Functions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>AI Interaction Insights</CardTitle>
              <CardDescription>
                Key metrics on how doctors engage with the AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Average Queries per Session
                  </p>
                  <Badge variant="secondary">
                    <MessageSquare className="h-3 w-3 mr-1" /> 5.2
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Top AI-Assisted Specialties
                  </p>
                  <Badge variant="secondary">
                    <Stethoscope className="h-3 w-3 mr-1" /> Cardiology
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    AI Suggestion Acceptance Rate
                  </p>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" /> 85%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Engagement</CardTitle>
              <CardDescription>
                Popular documents and resources accessed by doctors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Most Viewed Document</p>
                  <Badge variant="secondary">
                    <FileText className="h-3 w-3 mr-1" /> Medical Guidelines
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Average Document Downloads
                  </p>
                  <Badge variant="secondary">
                    <Download className="h-3 w-3 mr-1" /> 3.1
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    New Documents This Month
                  </p>
                  <Badge variant="secondary">
                    <Upload className="h-3 w-3 mr-1" /> 5
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Feedback & Support</CardTitle>
              <CardDescription>
                Overview of doctor feedback and support requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    New Feedback Submissions
                  </p>
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" /> 7
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Resolved Support Tickets
                  </p>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" /> 15
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Average Resolution Time</p>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" /> 24 hrs
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
            <TabsTrigger value="documents">Document Management</TabsTrigger>
          </TabsList>

          {/* Doctor Management Tab */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Registrations</CardTitle>
                <CardDescription>
                  Manage doctor account approvals and view registration details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">
                            {doctor.name}
                          </TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.specialty}</TableCell>
                          <TableCell>
                            {doctor.registrationDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {doctor.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleDoctorAction(doctor.id, "approve")
                                    }
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDoctorAction(doctor.id, "reject")
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {doctor.status !== "pending" && (
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Management Tab */}
          <TabsContent value="documents">
            <div className="space-y-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload PDF documents for doctors to access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Select PDF File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleFileUpload} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents List */}
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                  <CardDescription>
                    Manage documents available to doctors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Name</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>File Size</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                              {doc.name}
                            </TableCell>
                            <TableCell>
                              {doc.uploadDate.toLocaleDateString()}
                            </TableCell>
                            <TableCell>{doc.size}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{doc.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
