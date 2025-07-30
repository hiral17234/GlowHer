
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addDays, isBefore, isToday, parseISO } from 'date-fns';
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
import { CalendarIcon, ChevronLeft, Plus, Trash2, AlertTriangle, Apple, Milk, Carrot, Wheat, Cookie, X, Tag, Package, Edit, SortAsc, History, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const groceryItemSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  category: z.string().optional(),
  expiryDate: z.date().optional(),
  quantity: z.string().optional(),
  storageLocation: z.string().optional(),
});

type GroceryItem = z.infer<typeof groceryItemSchema> & { id: string; purchased: boolean; dateAdded: string; };

const categories = [
    { name: 'Fruits', icon: Apple },
    { name: 'Vegetables', icon: Carrot },
    { name: 'Dairy', icon: Milk },
    { name: 'Grains', icon: Wheat },
    { name: 'Snacks', icon: Cookie },
    { name: 'Meat', icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-drumstick"><path d="M12.4 12.4a1 1 0 1 0-1.5 1.5l-3.3 3.3a1 1 0 1 0 1.4 1.4l3.3-3.3a1 1 0 0 0 1.5-1.5Z"/><path d="m20.9 10.1-6.2-6.2a1 1 0 0 0-1.4 0L4.1 13.1a1 1 0 0 0 0 1.4l6.2 6.2a1 1 0 0 0 1.4 0l9.2-9.2a1 1 0 0 0 0-1.4Z"/><path d="m11.1 5.1 3.5 3.5"/><path d="m5.1 11.1 3.5 3.5"/></svg> },
    { name: 'Other', icon: Plus },
];

const storageLocations = ['Fridge', 'Freezer', 'Pantry'];

const LOCAL_STORAGE_KEY = 'glowher-grocery-list';

export default function GroceryListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [sort, setSort] = useState<string>('dateAdded-desc');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);

  const form = useForm<z.infer<typeof groceryItemSchema>>({
    resolver: zodResolver(groceryItemSchema),
    defaultValues: { name: "", category: "Other", quantity: "", storageLocation: "Pantry" },
  });

  useEffect(() => {
    try {
      const savedList = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedList) {
        const parsedList = JSON.parse(savedList).map((item: any) => ({
            ...item,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            dateAdded: item.dateAdded || new Date().toISOString(),
        }));
        setGroceryList(parsedList);
      }
    } catch (error) { console.error("Failed to load grocery list from localStorage", error); }
  }, []);

  const saveList = (list: GroceryItem[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        setGroceryList(list);
    } catch (error) { toast({ variant: 'destructive', title: "Error", description: "Could not save the grocery list."}); }
  }

  const onSubmit = (data: z.infer<typeof groceryItemSchema>) => {
    if(editingItem) {
        // Update existing item
        const updatedList = groceryList.map(item => item.id === editingItem.id ? { ...item, ...data } : item);
        saveList(updatedList);
        toast({ title: "Item Updated", description: `${data.name} has been updated.` });
        setEditingItem(null);
    } else {
        // Add new item
        const newItem: GroceryItem = { ...data, id: new Date().toISOString(), purchased: false, dateAdded: new Date().toISOString() };
        saveList([...groceryList, newItem]);
        toast({ title: "Item Added", description: `${newItem.name} has been added to your list.` });
    }
    form.reset({ name: "", category: "Other", quantity: "", storageLocation: "Pantry" });
  };
  
  const togglePurchased = (id: string) => { saveList(groceryList.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item)); };
  const deleteItem = (id: string) => { saveList(groceryList.filter(item => item.id !== id)); toast({ title: "Item Removed" }); };
  const handleEditClick = (item: GroceryItem) => { setEditingItem(item); form.reset(item); };

  const expiringItems = groceryList.filter(item => {
    if (!item.expiryDate || item.purchased) return false;
    const threeDaysFromNow = addDays(new Date(), 3);
    return isBefore(item.expiryDate, threeDaysFromNow) && !isBefore(item.expiryDate, new Date()) || isToday(item.expiryDate);
  });

  const sortedAndFilteredList = useMemo(() => {
    let list = [...groceryList];
    
    // Filter
    if(filter !== 'All') {
        list = list.filter(item => item.category === filter);
    }

    // Sort
    const [sortKey, sortDir] = sort.split('-');
    list.sort((a, b) => {
        let valA, valB;
        switch (sortKey) {
            case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
            case 'expiryDate': valA = a.expiryDate ? a.expiryDate.getTime() : Infinity; valB = b.expiryDate ? b.expiryDate.getTime() : Infinity; break;
            case 'dateAdded': default: valA = parseISO(a.dateAdded).getTime(); valB = parseISO(b.dateAdded).getTime(); break;
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    return list;
  }, [groceryList, filter, sort]);


  const getCategoryIcon = (categoryName?: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : Plus;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6 z-10"><div className="flex justify-between items-center"><GlowHerLogo /><Button variant="ghost" onClick={() => router.push('/')}><ChevronLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button></div></header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8"><h1 className="font-headline text-4xl md:text-5xl font-bold">Grocery List</h1><p className="mt-2 text-lg text-muted-foreground">Plan your meals and reduce waste.</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="shadow-lg sticky top-8">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Plus/> {editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle></CardHeader>
                    <CardContent><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Item Name</FormLabel><FormControl><Input placeholder="e.g., Almond Milk" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => (<SelectItem key={cat.name} value={cat.name}><div className="flex items-center gap-2"><cat.icon className="h-4 w-4" />{cat.name}</div></SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantity (Optional)</FormLabel><FormControl><Input placeholder="e.g., 1 carton" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="storageLocation" render={({ field }) => (<FormItem><FormLabel>Storage Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger></FormControl><SelectContent>{storageLocations.map(loc => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Expiry Date (Optional)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                        <Button type="submit" className="w-full">{editingItem ? 'Update Item' : 'Add to List'}</Button>
                        {editingItem && <Button type="button" variant="ghost" className="w-full" onClick={() => { setEditingItem(null); form.reset({ name: "", category: "Other", quantity: "", storageLocation: "Pantry" }); }}>Cancel Edit</Button>}
                    </form></Form></CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 {expiringItems.length > 0 && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>You have {expiringItems.length} item(s) expiring soon!</AlertTitle><AlertDescription>Don't forget to use: {expiringItems.map(item => item.name).join(', ')}.</AlertDescription></Alert>)}
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle>Your List</CardTitle>
                             <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline"><SortAsc className="mr-2 h-4 w-4" />Sort By</Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => setSort('dateAdded-desc')}>Date Added (Newest)</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setSort('dateAdded-asc')}>Date Added (Oldest)</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setSort('name-asc')}>Name (A-Z)</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setSort('expiryDate-asc')}>Expiry (Soonest)</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                         <div className="flex flex-wrap gap-2 pt-4">
                            <Button size="sm" variant={filter === 'All' ? 'secondary' : 'outline'} onClick={() => setFilter('All')}>All</Button>
                            {categories.map(cat => (<Button key={cat.name} size="sm" variant={filter === cat.name ? 'secondary' : 'outline'} onClick={() => setFilter(cat.name)}><cat.icon className="mr-2 h-4 w-4" />{cat.name}</Button>))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {sortedAndFilteredList.length > 0 ? (
                           <ul className="space-y-4">
                            {sortedAndFilteredList.map(item => {
                                const isExpiring = expiringItems.some(expItem => expItem.id === item.id);
                                const CategoryIcon = getCategoryIcon(item.category);
                                return (
                                <li key={item.id} className={cn("flex items-start gap-4 p-4 rounded-lg transition-all", item.purchased ? "bg-muted/50" : "bg-card", isExpiring && !item.purchased && "bg-destructive/10 border border-destructive/20")}>
                                    <Checkbox id={item.id} checked={item.purchased} onCheckedChange={() => togglePurchased(item.id)} aria-label={`Mark ${item.name} as purchased`} className="mt-1" />
                                    <div className="flex-grow">
                                        <label htmlFor={item.id} className={cn("font-medium text-lg", item.purchased && "line-through text-muted-foreground")}>{item.name}</label>
                                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                            <Badge variant="outline" className="flex items-center gap-1"><CategoryIcon className="h-3 w-3" />{item.category}</Badge>
                                            {item.quantity && <Badge variant="outline" className="flex items-center gap-1"><Package className="h-3 w-3"/>{item.quantity}</Badge>}
                                            {item.storageLocation && <Badge variant="outline">{item.storageLocation}</Badge>}
                                            {item.expiryDate && (<span className={cn("flex items-center gap-1", isExpiring && "text-destructive font-semibold")}><AlertTriangle className={cn("h-4 w-4", !isExpiring && "hidden")} />Expires: {format(item.expiryDate, 'MMM d')}</span>)}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </li>
                                )})}
                           </ul>
                        ) : (<p className="text-center text-muted-foreground py-8">{groceryList.length === 0 ? "Your grocery list is empty. Add an item to get started!" : `No items in the "${filter}" category.`}</p>)}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}

    