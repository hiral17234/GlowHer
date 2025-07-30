
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addDays, isBefore, isToday } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowHerLogo } from '@/components/glowher/GlowHerLogo';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronLeft, Plus, Trash2, AlertTriangle, Apple, Milk, Carrot, Wheat, Cookie, X, Tag, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const groceryItemSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  category: z.string().optional(),
  expiryDate: z.date().optional(),
  quantity: z.string().optional(),
  storageLocation: z.string().optional(),
});

type GroceryItem = z.infer<typeof groceryItemSchema> & { id: string; purchased: boolean };

const categories = [
    { name: 'Fruits', icon: Apple },
    { name: 'Vegetables', icon: Carrot },
    { name: 'Dairy', icon: Milk },
    { name: 'Grains', icon: Wheat },
    { name: 'Snacks', icon: Cookie },
    { name: 'Other', icon: Plus },
];

const storageLocations = ['Fridge', 'Freezer', 'Pantry'];

const LOCAL_STORAGE_KEY = 'glowher-grocery-list';

export default function GroceryListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [filter, setFilter] = useState<string>('All');

  const form = useForm<z.infer<typeof groceryItemSchema>>({
    resolver: zodResolver(groceryItemSchema),
    defaultValues: {
      name: "",
      category: "Other",
      quantity: "",
      storageLocation: "Pantry",
    },
  });

  useEffect(() => {
    try {
      const savedList = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedList) {
        const parsedList = JSON.parse(savedList);
        // Ensure dates are parsed back into Date objects
        parsedList.forEach((item: GroceryItem) => {
            if (item.expiryDate) {
                item.expiryDate = new Date(item.expiryDate);
            }
        });
        setGroceryList(parsedList);
      }
    } catch (error) {
        console.error("Failed to load grocery list from localStorage", error);
    }
  }, []);

  const saveList = (list: GroceryItem[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        setGroceryList(list);
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Could not save the grocery list."});
    }
  }

  const onSubmit = (data: z.infer<typeof groceryItemSchema>) => {
    const newItem: GroceryItem = {
      ...data,
      id: new Date().toISOString(),
      purchased: false,
    };
    saveList([...groceryList, newItem]);
    form.reset();
    toast({ title: "Item Added", description: `${newItem.name} has been added to your list.` });
  };
  
  const togglePurchased = (id: string) => {
    const updatedList = groceryList.map(item =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    );
    saveList(updatedList);
  };

  const deleteItem = (id: string) => {
    const updatedList = groceryList.filter(item => item.id !== id);
    saveList(updatedList);
    toast({ title: "Item Removed", description: "The item has been removed from your list." });
  };

  const expiringItems = groceryList.filter(item => {
    if (!item.expiryDate || item.purchased) return false;
    const threeDaysFromNow = addDays(new Date(), 3);
    return isBefore(item.expiryDate, threeDaysFromNow) && !isBefore(item.expiryDate, new Date()) || isToday(item.expiryDate);
  });

  const filteredList = groceryList.filter(item => {
    if (filter === 'All') return true;
    return item.category === filter;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6 z-10">
        <div className="flex justify-between items-center">
          <GlowHerLogo />
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Grocery List</h1>
          <p className="mt-2 text-lg text-muted-foreground">Plan your meals and reduce waste.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="shadow-lg sticky top-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Plus/> Add New Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Almond Milk" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.name} value={cat.name}>
                                                        <div className="flex items-center gap-2">
                                                            <cat.icon className="h-4 w-4" />
                                                            {cat.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 1 carton" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="storageLocation"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Storage Location (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a location" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {storageLocations.map(loc => (
                                                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="expiryDate"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Expiry Date (Optional)</FormLabel>
                                        <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Add to List</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 {expiringItems.length > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Expiring Soon!</AlertTitle>
                        <AlertDescription>
                            The following items are expiring soon: {expiringItems.map(item => item.name).join(', ')}.
                        </AlertDescription>
                    </Alert>
                )}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Your List</CardTitle>
                         <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant={filter === 'All' ? 'secondary' : 'outline'} onClick={() => setFilter('All')}>All</Button>
                            {categories.map(cat => (
                                <Button key={cat.name} variant={filter === cat.name ? 'secondary' : 'outline'} onClick={() => setFilter(cat.name)}>
                                     <cat.icon className="mr-2 h-4 w-4" />
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredList.length > 0 ? (
                           <ul className="space-y-4">
                            {filteredList.map(item => {
                                const isExpiring = expiringItems.some(expItem => expItem.id === item.id);
                                return (
                                <li key={item.id} className={cn("flex items-start gap-4 p-4 rounded-lg", item.purchased ? "bg-muted/50" : "bg-card", isExpiring && !item.purchased && "bg-destructive/10 border border-destructive/20")}>
                                    <Checkbox
                                        id={item.id}
                                        checked={item.purchased}
                                        onCheckedChange={() => togglePurchased(item.id)}
                                        className="mt-1"
                                    />
                                    <div className="flex-grow">
                                        <label htmlFor={item.id} className={cn("font-medium", item.purchased && "line-through text-muted-foreground")}>
                                            {item.name}
                                        </label>
                                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                            <Badge variant="outline" className="flex items-center gap-1"><Tag className="h-3 w-3" />{item.category}</Badge>
                                            {item.quantity && <Badge variant="outline" className="flex items-center gap-1"><Package className="h-3 w-3"/>{item.quantity}</Badge>}
                                            {item.storageLocation && <Badge variant="outline">{item.storageLocation}</Badge>}
                                            {item.expiryDate && (
                                                <span className={cn("flex items-center gap-1", isExpiring && "text-destructive font-semibold")}>
                                                    {isExpiring && <AlertTriangle className="h-4 w-4" />}
                                                    Expires: {format(item.expiryDate, 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </li>
                                )
                            })}
                           </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                {groceryList.length === 0 ? "Your grocery list is empty. Add an item to get started!" : `No items in the "${filter}" category.`}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
