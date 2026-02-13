'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Calendar, DollarSign, Save, ArrowLeft, MapPin, Truck } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Textarea } from '@/app/components/ui/textarea';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Project {
  id: string;
  name: string;
}

interface Trip {
  id: string;
  date: string;
  detail: string;
  vehicleType: string;
  fromLocation: string;
  toLocation: string;
  mileageStart: number;
  mileageEnd: number;
  distance: number;
  fuelCost: number;
  transportFee: number;
  expressFee: number;
  parkingFee: number;
}

export default function TravelExpensePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Settings - could be fetched from API/Env in real app
  const MILEAGE_RATE = 6; // THB per km

  // Form State
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Summary State
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    calculateTotals();
  }, [trips]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/timesheet/projects?userId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const addTrip = () => {
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      detail: '',
      vehicleType: 'Personal Car',
      fromLocation: '',
      toLocation: '',
      mileageStart: 0,
      mileageEnd: 0,
      distance: 0,
      fuelCost: 0,
      transportFee: 0,
      expressFee: 0,
      parkingFee: 0
    };
    setTrips([...trips, newTrip]);
  };

  const removeTrip = (id: string) => {
    setTrips(trips.filter(t => t.id !== id));
  };

  const updateTrip = (id: string, field: keyof Trip, value: any) => {
    setTrips(trips.map(t => {
      if (t.id !== id) return t;
      
      const updated = { ...t, [field]: value };
      
      // Auto-calculate distance if mileage changes
      if (field === 'mileageStart' || field === 'mileageEnd') {
        const start = field === 'mileageStart' ? Number(value) : t.mileageStart;
        const end = field === 'mileageEnd' ? Number(value) : t.mileageEnd;
        if (end > start) {
            updated.distance = end - start;
            // Auto-calculate fuel cost for personal car
            if (t.vehicleType === 'Personal Car') {
              updated.fuelCost = updated.distance * MILEAGE_RATE;
            }
        } else {
            updated.distance = 0;
            if (t.vehicleType === 'Personal Car') {
              updated.fuelCost = 0;
            }
        }
      }
      
      // Re-calculate if vehicle type changes
      if (field === 'vehicleType') {
         if (value === 'Personal Car') {
            updated.fuelCost = (updated.distance || 0) * MILEAGE_RATE;
         }
      }
      
      return updated;
    }));
  };

  const calculateTotals = () => {
    let dist = 0;
    let amt = 0;
    trips.forEach(t => {
      dist += Number(t.distance || 0);
      amt += Number(t.fuelCost || 0) + Number(t.transportFee || 0) + Number(t.expressFee || 0) + Number(t.parkingFee || 0);
    });
    setTotalDistance(dist);
    setTotalAmount(amt);
  };

  const handleSubmit = async () => {
    if (!projectId || !description || trips.length === 0) {
      toast.error('Please fill in project, description and at least one trip');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: user?.id,
        project_id: projectId,
        date: startDate, // Use start date as the main date
        amount: totalAmount,
        category: 'Travel',
        description: description,
        details: {
          type: 'domestic_travel_claim',
          startDate,
          endDate,
          trips,
          summary: {
            totalDistance,
            totalAmount
          }
        }
      };

      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Travel claim submitted successfully');
        // Redirect or clear
        window.location.href = '/expenses';
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to submit claim');
      }
    } catch (error) {
      console.error('Submit error', error);
      toast.error('Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="Travel Reimbursement" breadcrumbs={[{ label: 'Expenses', href: '/expenses' }, { label: 'Travel Claim' }]} />
      
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/expenses">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New Travel Claim</h1>
                <p className="text-slate-500">Submit a domestic travel reimbursement request</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Trip Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project</label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description / Purpose</label>
                            <Input 
                                placeholder="e.g. Site Visit to Rayong" 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Mileage Rate: <strong>{MILEAGE_RATE} THB/km</strong> (Personal Car)
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Claim Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Total Distance</span>
                        <span className="font-medium">{totalDistance.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-lg font-bold">Total Amount</span>
                        <span className="text-2xl font-bold text-blue-600">฿{totalAmount.toLocaleString()}</span>
                    </div>
                    <Button className="w-full mt-4" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Claim'}
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Trips Table */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Itinerary & Expenses</CardTitle>
                <Button onClick={addTrip} variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Trip
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead className="w-[150px]">Detail</TableHead>
                                <TableHead className="w-[120px]">Vehicle</TableHead>
                                <TableHead className="w-[200px]">Route (From - To)</TableHead>
                                <TableHead className="w-[100px]">Distance (km)</TableHead>
                                <TableHead className="w-[100px]">Fuel (฿)</TableHead>
                                <TableHead className="w-[100px]">Transport (฿)</TableHead>
                                <TableHead className="w-[100px]">Express (฿)</TableHead>
                                <TableHead className="w-[100px]">Parking (฿)</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                                        No trips added. Click "Add Trip" to start.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                trips.map(trip => (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            <Input 
                                                type="date" 
                                                value={trip.date} 
                                                onChange={e => updateTrip(trip.id, 'date', e.target.value)}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                placeholder="Meeting..." 
                                                value={trip.detail} 
                                                onChange={e => updateTrip(trip.id, 'detail', e.target.value)}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select value={trip.vehicleType} onValueChange={v => updateTrip(trip.id, 'vehicleType', v)}>
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Personal Car">Personal Car</SelectItem>
                                                    <SelectItem value="Company Car">Company Car</SelectItem>
                                                    <SelectItem value="Taxi/Grab">Taxi/Grab</SelectItem>
                                                    <SelectItem value="Public Transport">Public Transport</SelectItem>
                                                    <SelectItem value="Flight">Flight</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 items-center">
                                                <Input 
                                                    placeholder="From" 
                                                    value={trip.fromLocation} 
                                                    onChange={e => updateTrip(trip.id, 'fromLocation', e.target.value)}
                                                    className="h-8"
                                                />
                                                <span>-</span>
                                                <Input 
                                                    placeholder="To" 
                                                    value={trip.toLocation} 
                                                    onChange={e => updateTrip(trip.id, 'toLocation', e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={trip.distance} 
                                                onChange={e => updateTrip(trip.id, 'distance', Number(e.target.value))}
                                                className="h-8 w-20"
                                                disabled={trip.vehicleType !== 'Personal Car' && trip.vehicleType !== 'Company Car'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={trip.fuelCost} 
                                                onChange={e => updateTrip(trip.id, 'fuelCost', Number(e.target.value))}
                                                className="h-8 w-20"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={trip.transportFee} 
                                                onChange={e => updateTrip(trip.id, 'transportFee', Number(e.target.value))}
                                                className="h-8 w-20"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={trip.expressFee} 
                                                onChange={e => updateTrip(trip.id, 'expressFee', Number(e.target.value))}
                                                className="h-8 w-20"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={trip.parkingFee} 
                                                onChange={e => updateTrip(trip.id, 'parkingFee', Number(e.target.value))}
                                                className="h-8 w-20"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeTrip(trip.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
