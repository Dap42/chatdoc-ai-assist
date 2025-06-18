
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Activity, Clock, Users, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DoctorLayout from '../components/DoctorLayout';

const DoctorDashboard = () => {
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const stats = {
    totalChats: 24,
    activeChats: 3,
    todayChats: 8,
    aiAssists: 45
  };

  const recentChats = [
    { id: 1, patientName: 'Patient A', lastMessage: 'Thank you for the consultation', time: '2 min ago', status: 'active' },
    { id: 2, patientName: 'Patient B', lastMessage: 'I have been feeling better', time: '15 min ago', status: 'completed' },
    { id: 3, patientName: 'Patient C', lastMessage: 'Could you please clarify...', time: '1 hour ago', status: 'pending' },
  ];

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}</h1>
          <p className="text-blue-100">Here's your medical consultation overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalChats}</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeChats}</div>
              <p className="text-xs text-gray-600">Currently ongoing</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Chats</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.todayChats}</div>
              <p className="text-xs text-gray-600">Since morning</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Assists</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.aiAssists}</div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/chat">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </Link>
            <Link to="/doctor-profile">
              <Button variant="outline" className="w-full h-12 border-blue-600 text-blue-600 hover:bg-blue-50">
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-12 border-green-600 text-green-600 hover:bg-green-50">
              <Activity className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
            <CardDescription>Your latest patient interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChats.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{chat.patientName}</p>
                      <p className="text-sm text-gray-600">{chat.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      chat.status === 'active' ? 'default' :
                      chat.status === 'completed' ? 'secondary' : 'outline'
                    }>
                      {chat.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{chat.time}</span>
                    <Link to={`/chat/${chat.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Disclaimer */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">AI Assistant Reminder</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The AI assistant provides preliminary insights and terminology support only. 
                  All final medical decisions and diagnoses must be made by you as the healthcare professional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
