
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  Brain,
  Clock,
  Activity
} from 'lucide-react';
import DoctorLayout from '../components/DoctorLayout';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'doctor' | 'patient' | 'ai';
  timestamp: Date;
}

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  symptoms: string[];
  status: 'active' | 'waiting' | 'completed';
}

const ChatInterface = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock patient data
  const patientInfo: PatientInfo = {
    id: patientId || '1',
    name: 'Patient A',
    age: 32,
    gender: 'Female',
    symptoms: ['Headache', 'Fever', 'Fatigue'],
    status: 'active'
  };

  // Mock initial messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        content: 'Hello Doctor, I have been experiencing severe headaches for the past 3 days.',
        sender: 'patient',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        content: 'I understand you\'re experiencing headaches. Can you describe the pain? Is it throbbing, sharp, or dull?',
        sender: 'doctor',
        timestamp: new Date(Date.now() - 3300000)
      },
      {
        id: '3',
        content: 'Based on the symptoms mentioned, consider asking about: duration of symptoms, associated nausea, light sensitivity, and any recent stress factors.',
        sender: 'ai',
        timestamp: new Date(Date.now() - 3000000)
      }
    ];
    setMessages(initialMessages);

    // Mock AI suggestions
    setAiSuggestions([
      'Ask about frequency and timing of headaches',
      'Inquire about any triggers or recent changes',
      'Check for associated symptoms like nausea or vision changes'
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'doctor',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response after doctor's message
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Medical terminology note: ${message.includes('headache') ? 'Cephalgia refers to head pain. Consider tension headaches, migraines, or cluster headaches.' : 'Consider documenting symptoms systematically for accurate assessment.'}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <DoctorLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Patient Info Sidebar */}
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{patientInfo.name}</p>
                <p className="text-sm text-gray-600">Age: {patientInfo.age}, {patientInfo.gender}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Reported Symptoms:</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {patientInfo.symptoms.map((symptom, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={patientInfo.status === 'active' ? 'default' : 'outline'}>
                  {patientInfo.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                <Brain className="h-4 w-4 text-blue-600" />
                AI Suggestions
              </CardTitle>
              <CardDescription className="text-xs text-blue-700">
                Click on a suggestion to use it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aiSuggestions.map((suggestion, i) => (
                <div 
                  key={i} 
                  className="text-xs p-2 bg-white rounded border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Medical Disclaimer */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-xs text-yellow-800">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p>
                  AI suggestions are for assistance only. Use your professional judgment for all medical decisions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Session duration:</span>
                </div>
                <span>32 minutes</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>AI assists:</span>
                </div>
                <span>5</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="py-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Chat with {patientInfo.name}
              </CardTitle>
              <Badge className="bg-blue-500">
                Active Session
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto flex flex-col p-4">
            <div className="flex-1 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`
                    flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}
                    ${msg.sender === 'ai' ? 'px-6' : ''}
                  `}
                >
                  <div 
                    className={`
                      max-w-[70%] rounded-lg p-3
                      ${msg.sender === 'doctor' ? 'bg-blue-600 text-white' : ''}
                      ${msg.sender === 'patient' ? 'bg-gray-200 text-gray-800' : ''}
                      ${msg.sender === 'ai' ? 'bg-blue-50 text-blue-800 border border-blue-200 w-full' : ''}
                    `}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-1 mb-1 text-xs font-medium text-blue-700">
                        <Bot className="h-3 w-3" />
                        AI Assistant
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70 text-right">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, AI assistance will analyze your messages
            </p>
          </div>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default ChatInterface;
