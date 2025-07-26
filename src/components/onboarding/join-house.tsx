'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { User, House } from '@/lib/types';
import * as firestore from '@/lib/firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  joinCode: z.string().length(8, 'Join code must be exactly 8 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

interface JoinHouseProps {
  user: User;
  onHouseJoined: (house: House) => void;
}

export function JoinHouse({ user, onHouseJoined }: JoinHouseProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { joinCode: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const house = await firestore.getHouseByJoinCode(data.joinCode);
      if (!house) {
        throw new Error("No house found with that join code. Please double-check and try again.");
      }

      await firestore.createJoinRequest(house.id, user.uid, user.name);

      toast({
          title: "Request Sent!",
          description: `Your request to join ${house.name} has been sent to the owner for approval.`
      });

      // Visually, the user has to wait. We can reset the form.
      form.reset();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Joining House',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join an Existing Household</CardTitle>
        <CardDescription>Enter the 8-character join code from the house owner.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="joinCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Join Code</FormLabel>
                  <FormControl>
                    <Input placeholder="AbCdEf12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending Request...' : 'Request to Join'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
