
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  FileText, 
  Search, 
  Shield, 
  LogOut, 
  Check, 
  X, 
  MoreVertical, 
  Upload,
  Eye,
  Trash,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: Date;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);

  // Mock doctors data
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. John Smith',
      email: 'john.smith@example.com',
      specialty: 'Cardiology',
      status: 'approved',
      registrationDate: new Date(2023, 3, 15)
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      specialty: 'Pediatrics',
      status: 'pending',
      registrationDate: new Date(2023, 5, 22)
    },
    {
      id: '3',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com',
      specialty: 'Neurology',
      status: 'pending',
      registrationDate: new Date(2023, 6, 10)
    },
    {
      id: '4',
      name: 'Dr. Emily Taylor',
      email: 'emily.taylor@example.com',
      specialty: 'Dermatology',
      status: 'rejected',
      registrationDate: new Date(2023, 5, 5)
    },
    {
      id: '5',
      name: 'Dr. James Wilson',
      email: 'james.wilson@example.com',
      specialty: 'Orthopedics',
      status: 'approved',
      registrationDate: new Date(2023, 4, 28)
    }
  ]);

  // Mock PDFs data
  const [pdfs, setPdfs] = useState([
    { id: '1', name: 'Clinical Guidelines 2023', description: 'Updated clinical protocols for common conditions', uploadDate: new Date(2023, 0, 15) },
    { id: '2', name: 'Patient Intake Form', description: 'Standard form for new patient registration', uploadDate: new Date(2023, 2, 10) },
    { id: '3', name: 'Medical Ethics Handbook', description: 'Guidelines on medical ethics and patient confidentiality', uploadDate: new Date(2023, 3, 22) },
  ]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPdf(e.target.files[0]);
      setPdfName(e.target.files[0].name.split('.')[0]);
    }
  };

  const handlePdfUpload = () => {
    if (!selectedPdf || !pdfName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a file and name for the PDF.",
        variant: "destructive",
      });
      return;
    }

    // Mock upload - replace with real API call
    const newPdf = {
      id: Date.now().toString(),
      name: pdfName,
      description: pdfDescription,
      uploadDate: new Date()
    };

    setPdfs([...pdfs, newPdf]);
    setSelectedPdf(null);
    setPdfName('');
    setPdfDescription('');
    
    toast({
      title: "PDF Uploaded",
      description: "The document has been uploaded successfully.",
    });
  };

  const handleSelectDoctor = (doctorId: string) => {
    if (selectedDoctors.includes(doctorId)) {
      setSelectedDoctors(selectedDoctors.filter(id => id !== doctorId));
    } else {
      setSelectedDoctors([...selectedDoctors, doctorId]);
    }
  };

  const handleSelectAllDoctors = (checked: boolean) => {
    if (checked) {
      setSelectedDoctors(filteredDoctors.map(doctor => doctor.id));
    } else {
      setSelectedDoctors([]);
    }
  };

  const updateDoctorStatus = (doctorId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updatedDoctors = doctors.map(doctor => 
      doctor.id === doctorId ? { ...doctor, status } : doctor
    );
    setDoctors(updatedDoctors);
    
    toast({
      title: "Status Updated",
      description: `Doctor status has been updated to ${status}.`,
    });
  };

  const handleDeletePdf = (pdfId: string) => {
    setPdfs(pdfs.filter(pdf => pdf.id !== pdfId));
    
    toast({
      title: "PDF Deleted",
      description: "The document has been deleted successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-gray-400">Doctor AI Chat Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="doctors" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Doctor Management
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              PDF Documents
            </TabsTrigger>
          </TabsList>
          
          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">Doctors List</CardTitle>
                  <CardDescription>
                    Manage registrations and doctor accounts
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search doctors..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            onCheckedChange={(checked) => 
                              handleSelectAllDoctors(checked as boolean)
                            } 
                            checked={selectedDoctors.length === filteredDoctors.length && filteredDoctors.length > 0}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                            No doctors found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDoctors.map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedDoctors.includes(doctor.id)} 
                                onCheckedChange={() => handleSelectDoctor(doctor.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {doctor.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{doctor.name}</p>
                                  <p className="text-xs text-gray-500">{doctor.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{doctor.specialty}</TableCell>
                            <TableCell>{doctor.registrationDate.toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  doctor.status === 'approved' ? 'default' :
                                  doctor.status === 'pending' ? 'outline' : 'destructive'
                                }
                              >
                                {doctor.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => updateDoctorStatus(doctor.id, 'approved')}
                                    className="text-green-600"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateDoctorStatus(doctor.id, 'rejected')}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-600">
                  {selectedDoctors.length} of {doctors.length} doctors selected
                </p>
                <div className="flex gap-2">
                  {selectedDoctors.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => {
                          const updatedDoctors = doctors.map(doctor => 
                            selectedDoctors.includes(doctor.id) ? { ...doctor, status: 'approved' } : doctor
                          );
                          setDoctors(updatedDoctors);
                          toast({
                            title: "Bulk Action Completed",
                            description: `${selectedDoctors.length} doctors have been approved.`,
                          });
                          setSelectedDoctors([]);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve Selected
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          const updatedDoctors = doctors.map(doctor => 
                            selectedDoctors.includes(doctor.id) ? { ...doctor, status: 'rejected' } : doctor
                          );
                          setDoctors(updatedDoctors);
                          toast({
                            title: "Bulk Action Completed",
                            description: `${selectedDoctors.length} doctors have been rejected.`,
                          });
                          setSelectedDoctors([]);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject Selected
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* PDF Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">PDF Documents</CardTitle>
                <CardDescription>
                  Upload and manage documents for doctors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload New PDF */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload PDF Document</DialogTitle>
                      <DialogDescription>
                        Upload a PDF document for doctors to access
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="pdf">PDF File</Label>
                        <Input 
                          id="pdf" 
                          type="file" 
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="pdfName">Document Name</Label>
                        <Input 
                          id="pdfName" 
                          value={pdfName} 
                          onChange={(e) => setPdfName(e.target.value)} 
                          placeholder="Enter document name"
                        />
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="pdfDescription">Description (Optional)</Label>
                        <Input 
                          id="pdfDescription" 
                          value={pdfDescription} 
                          onChange={(e) => setPdfDescription(e.target.value)} 
                          placeholder="Enter description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => {
                        setSelectedPdf(null);
                        setPdfName('');
                        setPdfDescription('');
                      }}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handlePdfUpload}>
                        Upload
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* PDF List */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pdfs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                            No documents uploaded yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        pdfs.map((pdf) => (
                          <TableRow key={pdf.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">{pdf.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-md truncate">{pdf.description}</TableCell>
                            <TableCell>{pdf.uploadDate.toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{pdf.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => handleDeletePdf(pdf.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Document Disclaimer */}
            <Card className="mt-6 bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Document Guidelines</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Ensure all uploaded documents comply with medical privacy regulations and do not contain any 
                      patient-identifiable information. Documents will be accessible by all approved doctors on the platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
