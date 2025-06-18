
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, GraduationCap, Save, UploadCloud, Shield, CheckCheck, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DoctorLayout from '../components/DoctorLayout';
import { useAuth } from '../contexts/AuthContext';

const DoctorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock profile data
  const [profile, setProfile] = useState({
    fullName: user?.name || 'Dr. John Smith',
    email: user?.email || 'doctor@example.com',
    age: '45',
    gender: 'male',
    specialty: 'Cardiology',
    degree: 'MD, MBBS',
    yearsOfPractice: '15',
    hospital: 'Central Hospital',
    bio: 'Experienced cardiologist specialized in interventional procedures with a focus on preventative cardiac care and lifestyle modifications.',
    qualifications: 'Board Certified in Cardiology\nFellow of American College of Cardiology\nCertified in Advanced Cardiac Life Support',
    profileImage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General Information</TabsTrigger>
            <TabsTrigger value="professional">Professional Details</TabsTrigger>
            <TabsTrigger value="security">Security & Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your personal and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-4 md:w-1/4">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={profile.profileImage || undefined} alt={profile.fullName} />
                        <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                          {profile.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Photo
                      </Button>
                    </div>
                    
                    <div className="space-y-4 md:w-3/4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="fullName"
                              name="fullName"
                              placeholder="Dr. John Smith"
                              value={profile.fullName}
                              onChange={handleChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="doctor@hospital.com"
                              value={profile.email}
                              onChange={handleChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            placeholder="45"
                            value={profile.age}
                            onChange={handleChange}
                            required
                            min="25"
                            max="80"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select 
                            value={profile.gender} 
                            onValueChange={(value) => handleSelectChange('gender', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          placeholder="Brief description of your medical practice, experience, and areas of expertise..."
                          value={profile.bio}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="professional" className="space-y-6 mt-6">
            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Your medical qualifications and practice details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select 
                      value={profile.specialty} 
                      onValueChange={(value) => handleSelectChange('specialty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                        <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Obstetrics">Obstetrics & Gynecology</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfPractice">Years of Practice</Label>
                    <Input
                      id="yearsOfPractice"
                      name="yearsOfPractice"
                      type="number"
                      value={profile.yearsOfPractice}
                      onChange={handleChange}
                      min="0"
                      max="60"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Medical Degree</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="degree"
                        name="degree"
                        placeholder="MD, MBBS, DO, etc."
                        value={profile.degree}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Primary Hospital/Clinic</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="hospital"
                        name="hospital"
                        placeholder="Hospital or clinic name"
                        value={profile.hospital}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Professional Qualifications & Certifications</Label>
                  <Textarea
                    id="qualifications"
                    name="qualifications"
                    placeholder="Board certifications, specializations, licenses, etc."
                    value={profile.qualifications}
                    onChange={handleChange}
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6 mt-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="mr-2 h-4 w-4" />
                  Update Security Settings
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
                <CardDescription>
                  Your account verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCheck className="h-5 w-5" />
                  <span className="font-medium">Your account is verified and active</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your medical credentials have been verified by our administrative team.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
