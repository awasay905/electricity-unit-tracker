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
  houseName: z.string().min(3, 'House name must be at least 3 characters.'),
  monthlyGoal: z.preprocess((val) => Number(val), z.number().min(1, 'Goal must be positive.')),
  initialReading: z.preprocess((val) => Number(val), z.number().min(0, 'Initial reading cannot be negative.')),
  billingDate: z.string().nonempty('Billing date is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateHouseProps {
  user: User;
  onHouseCreated: (house: House) => void;
}

export function CreateHouse({ user, onHouseCreated }: CreateHouseProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      houseName: '',
      monthlyGoal: 300,
      initialReading: 0,
      billingDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const newHouse = await firestore.createHouse(
        user.uid,
        data.houseName,
        data.monthlyGoal,
        { date: new Date(data.billingDate).toISOString(), units: data.initialReading }
      );
      if(newHouse){
        onHouseCreated(newHouse);
        toast({
          title: "House Created!",
          description: `Welcome to ${newHouse.name}.`
        })
      } else {
          throw new Error("Failed to create house data.");
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Creating House',
        description: error.message || 'An unknown error occurred.',
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Household</CardTitle>
        <CardDescription>Set up your home to start tracking electricity usage.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="houseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Household Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Power House" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly kWh Goal</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="billingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Billing Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="initialReading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Reading on Billing Date</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="e.g., 12345.6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Household'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
