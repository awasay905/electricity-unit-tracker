'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { House, User as UserIcon, Bell, Copy, Check, X, Trash2, UserPlus, Pencil, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import type { House as HouseType, User, JoinRequest, Reading } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EditReadingDialog } from './edit-reading-dialog';
import { ScrollArea } from '../ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


interface SettingsViewProps {
  user: User;
  house: HouseType;
  members: User[];
  joinRequests: JoinRequest[];
  readings: Reading[];
  onUpdateRequestStatus: (requestId: string, status: 'approved' | 'rejected') => void;
  onRemoveMember: (uid: string) => void;
  onUpdateHouseName: (name: string) => void;
  onUpdateUserName: (name: string) => void;
  onUpdateReading: (readingId: string, updates: Partial<Pick<Reading, 'value' | 'date'>>) => void;
  onDeleteReading: (readingId: string) => void;
}

export function SettingsView({
  user,
  house,
  members,
  joinRequests,
  readings,
  onUpdateRequestStatus,
  onRemoveMember,
  onUpdateHouseName,
  onUpdateUserName,
  onUpdateReading,
  onDeleteReading,
}: SettingsViewProps) {
  const isOwner = user.uid === house.ownerId;
  const [houseName, setHouseName] = useState(house.name);
  const [userName, setUserName] = useState(user.name);
  const [copied, setCopied] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(house.joinCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Join code copied to clipboard."});
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleHouseNameSave = () => {
      onUpdateHouseName(houseName);
      toast({ title: "House name updated."});
  }

  const handleUserNameSave = () => {
      onUpdateUserName(userName);
      toast({ title: "Your name has been updated."});
  }

  const handleEditClick = (reading: Reading) => {
    if (reading.isBillingCycleStart) {
        toast({
            variant: 'destructive',
            title: 'Action Not Allowed',
            description: 'Billing cycle start readings cannot be edited here. Update it via the "Set Goals & Billing" form.'
        });
        return;
    }
    setSelectedReading(reading);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (reading: Reading) => {
    if (reading.isBillingCycleStart) {
        toast({
            variant: 'destructive',
            title: 'Action Not Allowed',
            description: 'Billing cycle start readings cannot be deleted.'
        });
        return;
    }
    onDeleteReading(reading.id);
     toast({
        title: 'Reading Deleted',
        description: 'The reading has been successfully deleted.',
      });
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><UserIcon /> Profile Settings</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Name</Label>
            <div className="flex gap-2">
                <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
                <Button onClick={handleUserNameSave} disabled={userName === user.name}>Save</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email</Label>
            <Input id="userEmail" value={user.email} disabled />
          </div>
        </CardContent>
      </Card>

      {/* House Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><House /> House Settings</CardTitle>
          <CardDescription>Manage your household settings. Some options are only available to the owner.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="houseName">House Name</Label>
            <div className="flex gap-2">
                <Input id="houseName" value={houseName} onChange={(e) => setHouseName(e.target.value)} disabled={!isOwner} />
                {isOwner && <Button onClick={handleHouseNameSave} disabled={houseName === house.name}>Save</Button>}
            </div>
          </div>
          {isOwner && (
            <div className="space-y-2">
              <Label>House Join Code</Label>
              <div className="flex items-center gap-2">
                <Input value={house.joinCode} readOnly className="font-mono" />
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><UserPlus /> Members</h3>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.uid} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                   <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage data-ai-hint="person" src={`https://placehold.co/40x40.png?text=${member.name.charAt(0)}`} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{member.name} {member.uid === house.ownerId && <span className="text-xs text-accent-foreground bg-accent px-2 py-0.5 rounded-full ml-1">Owner</span>}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                   </div>
                  {isOwner && user.uid !== member.uid && (
                    <Button variant="destructive" size="icon" onClick={() => onRemoveMember(member.uid)}><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isOwner && joinRequests.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Bell /> Join Requests</h3>
                <div className="space-y-2">
                  {joinRequests.map(req => (
                    <div key={req.requestId} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <p className="font-medium">{req.requesterName} wants to join.</p>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => onUpdateRequestStatus(req.requestId, 'approved')}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="destructive" onClick={() => onUpdateRequestStatus(req.requestId, 'rejected')}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Manage Readings */}
      {isOwner && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><SlidersHorizontal /> Manage Readings</CardTitle>
                <CardDescription>As the owner, you can edit or delete past readings. Be careful, as this will affect historical data.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72 w-full pr-4">
                    <div className="space-y-2">
                        {readings.map(reading => (
                            <div key={reading.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div>
                                    <p className="font-semibold">{reading.value.toFixed(2)} kWh</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(reading.date).toLocaleDateString()}
                                        {reading.isBillingCycleStart && <span className="text-xs text-accent-foreground bg-accent px-2 py-0.5 rounded-full ml-2">Billing Start</span>}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEditClick(reading)} disabled={!!reading.isBillingCycleStart}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive" size="icon" disabled={!!reading.isBillingCycleStart}>
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the reading of <span className="font-bold">{reading.value.toFixed(2)} kWh</span> from <span className="font-bold">{new Date(reading.date).toLocaleDateString()}</span>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteClick(reading)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
      )}

      {selectedReading && (
        <EditReadingDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          reading={selectedReading}
          onSave={onUpdateReading}
        />
      )}
    </div>
  );
}
