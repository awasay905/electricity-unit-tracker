'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { House, User as UserIcon, Bell, Copy, Check, X, Trash2, UserPlus } from 'lucide-react';
import type { House as HouseType, User, JoinRequest } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SettingsViewProps {
  user: User;
  house: HouseType;
  members: User[];
  joinRequests: JoinRequest[];
  onUpdateRequestStatus: (requestId: string, status: 'approved' | 'rejected') => void;
  onRemoveMember: (uid: string) => void;
  onUpdateHouseName: (name: string) => void;
  onUpdateUserName: (name: string) => void;
}

export function SettingsView({
  user,
  house,
  members,
  joinRequests,
  onUpdateRequestStatus,
  onRemoveMember,
  onUpdateHouseName,
  onUpdateUserName
}: SettingsViewProps) {
  const isOwner = user.uid === house.ownerId;
  const [houseName, setHouseName] = useState(house.name);
  const [userName, setUserName] = useState(user.name);
  const [copied, setCopied] = useState(false);
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
    </div>
  );
}
