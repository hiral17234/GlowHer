
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addDays, isBefore, isToday, parseISO, startOfDay, isWithinInterval, isValid } from 'date-fns';
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
import { CalendarIcon, ChevronLeft, Plus, Trash2, AlertTriangle, Apple, Milk, Carrot, Wheat, Cookie, X, Tag, Package, Edit, SortAsc, History, Check, ShoppingCart, ArrowRight, EyeOff, MoreVertical } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const groceryItemSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  category: z.string().optional(),
  expiryDate: z.date().optional(),
  quantity: z.string().optional(),
  storageLocation: z.string().optional(),
});

const shoppingListItemSchema = z.object({
    name: z.string().min(1, "Item name is required."),
});

type GroceryItem = { 
  id: string; 
  name: string;
  category?: string;
  expiryDate?: Date;
  quantity?: string;
  storageLocation?: string;
  used: boolean; 
  archived: boolean;
  dateAdded: Date; 
};

type ShoppingListItem = { id: string; name: string; };

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

const INVENTORY_KEY = 'glowher-grocery-list';
const SHOPPING_LIST_KEY = 'glowher-shopping-list';
const DISMISSED_EXPIRED_KEY = 'glowher-dismissed-expired-items';

export default function GroceryListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [inventoryList, setInventoryList] = useState<GroceryItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [sort, setSort] = useState<string>('dateAdded-desc');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [dismissedExpiredIds, setDismissedExpiredIds] = useState<string[]>([]);

  const inventoryForm = useForm<z.infer<typeof groceryItemSchema>>({
    resolver: zodResolver(groceryItemSchema),
    defaultValues: { name: "", category: "Other", quantity: "", storageLocation: "Pantry" },
  });

  const shoppingListForm = useForm<z.infer<typeof shoppingListItemSchema>>({
    resolver: zodResolver(shoppingListItemSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    try {
      const savedInventory = localStorage.getItem(INVENTORY_KEY);
      if (savedInventory) {
        const parsedList = JSON.parse(savedInventory).map((item: any) => ({
            ...item,
            archived: item.archived || false, // Ensure archived property exists
            expiryDate: item.expiryDate ? parseISO(item.expiryDate) : undefined,
            dateAdded: item.dateAdded ? parseISO(item.dateAdded) : new Date(),
        }));
        setInventoryList(parsedList);
      }

      const savedShoppingList = localStorage.getItem(SHOPPING_LIST_KEY);
      if (savedShoppingList) {
        setShoppingList(JSON.parse(savedShoppingList));
      }

      const savedDismissedIds = localStorage.getItem(DISMISSED_EXPIRED_KEY);
      if(savedDismissedIds) {
          setDismissedExpiredIds(JSON.parse(savedDismissedIds));
      }

    } catch (error) { console.error("Failed to load lists from localStorage", error); }
  }, []);

  const saveInventoryList = (list: GroceryItem[]) => {
    try {
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(list));
        setInventoryList(list);
    } catch (error) { toast({ variant: 'destructive', title: "Error", description: "Could not save the grocery list."}); }
  }
  
  const saveShoppingList = (list: ShoppingListItem[]) => {
      try {
          localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(list));
          setShoppingList(list);
      } catch (error) { toast({ variant: 'destructive', title: "Error", description: "Could not save shopping list."}); }
  }

  const onInventorySubmit = (data: z.infer<typeof groceryItemSchema>) => {
    if(editingItem) {
        const updatedList = inventoryList.map(item => item.id === editingItem.id ? { ...item, ...data, used: item.used, dateAdded: item.dateAdded, archived: item.archived } : item);
        saveInventoryList(updatedList);
        toast({ title: "Item Updated", description: `${data.name} has been updated.` });
        setEditingItem(null);
    } else {
        const newItem: GroceryItem = { ...data, id: new Date().toISOString(), used: false, archived: false, dateAdded: new Date() };
        saveInventoryList([...inventoryList, newItem]);
        toast({ title: "Item Added", description: `${newItem.name} has been added to your inventory.` });
    }
    inventoryForm.reset({ name: "", category: "Other", quantity: "", storageLocation: "Pantry", expiryDate: undefined });
  };

  const onShoppingListSubmit = (data: z.infer<typeof shoppingListItemSchema>) => {
      const newItem: ShoppingListItem = { ...data, id: new Date().toISOString() };
      saveShoppingList([...shoppingList, newItem]);
      shoppingListForm.reset();
  };
  
  const markAsUsed = (id: string) => { saveInventoryList(inventoryList.map(item => item.id === id ? { ...item, used: true } : item)); };
  const archiveItem = (id: string) => { saveInventoryList(inventoryList.map(item => item.id === id ? { ...item, archived: true } : item)); toast({ title: "Item Hidden", description: "Item removed from inventory view." }); };
  const deleteInventoryItem = (id: string) => { saveInventoryList(inventoryList.filter(item => item.id !== id)); toast({ title: "Item Removed" }); };
  const deleteShoppingListItem = (id: string) => { saveShoppingList(shoppingList.filter(item => item.id !== id)); };
  const handleEditClick = (item: GroceryItem) => { setEditingItem(item); inventoryForm.reset({ ...item, expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined }); };
  
  const moveShoppingItemToInventory = (item: ShoppingListItem) => {
    const newItemForInventory: GroceryItem = {
        id: item.id,
        name: item.name,
        category: "Other",
        used: false,
        archived: false,
        dateAdded: new Date(),
    };
    saveInventoryList([...inventoryList, newItemForInventory]);
    deleteShoppingListItem(item.id);
    toast({ title: "Item Moved", description: `${item.name} moved to your inventory. You can now add more details.` });
  };

  const expiredItems = useMemo(() => inventoryList.filter(item => {
    if (!item.expiryDate || !isValid(item.expiryDate) || item.used || item.archived) return false;
    const today = startOfDay(new Date());
    return isBefore(item.expiryDate, today) || isToday(item.expiryDate);
  }), [inventoryList]);

  const expiringItems = useMemo(() => inventoryList.filter(item => {
    if (!item.expiryDate || !isValid(item.expiryDate) || item.used || item.archived || expiredItems.some(exp => exp.id === item.id)) return false;
    const tomorrow = addDays(startOfDay(new Date()), 1);
    const tenDaysFromNow = addDays(startOfDay(new Date()), 10);
    return isWithinInterval(item.expiryDate, { start: tomorrow, end: tenDaysFromNow });
  }), [inventoryList, expiredItems]);
  
  const handleDismissExpired = (itemId: string) => {
      const newDismissedIds = [...dismissedExpiredIds, itemId];
      setDismissedExpiredIds(newDismissedIds);
      try {
          localStorage.setItem(DISMISSED_EXPIRED_KEY, JSON.stringify(newDismissedIds));
      } catch (error) {
          console.error("Could not save dismissed items", error);
      }
  };

  const visibleExpiredItems = useMemo(() => expiredItems.filter(item => !dismissedExpiredIds.includes(item.id)), [expiredItems, dismissedExpiredIds]);


  const sortedAndFilteredList = (list: GroceryItem[]) => {
    let filteredList = [...list];
    
    if(filter !== 'All') {
        filteredList = filteredList.filter(item => item.category === filter);
    }

    const [sortKey, sortDir] = sort.split('-');
    filteredList.sort((a, b) => {
        let valA, valB;
        switch (sortKey) {
            case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
            case 'expiryDate': 
                valA = a.expiryDate && isValid(a.expiryDate) ? a.expiryDate.getTime() : Infinity; 
                valB = b.expiryDate && isValid(b.expiryDate) ? b.expiryDate.getTime() : Infinity; 
                break;
            case 'dateAdded': default: 
                valA = a.dateAdded.getTime();
                valB = b.dateAdded.getTime();
                break;
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    return filteredList;
  };

  const activeInventory = useMemo(() => sortedAndFilteredList(inventoryList.filter(item => !item.used && !item.archived)), [inventoryList, filter, sort]);
  const usedInventory = useMemo(() => sortedAndFilteredList(inventoryList.filter(item => item.used)), [inventoryList, filter, sort]);

  const getCategoryIcon = (categoryName?: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : Plus;
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-cover bg-center" style={{backgroundImage: "url('https://i.pinimg.com/1200x/4a/36/3a/4a363a52785a125131f1a104711adcd8.jpg')"}}>
        <div className="absolute inset-0 bg-black/60 z-0"/>
        <div className="relative z-10 flex flex-col flex-grow">
            <header className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center">
                    <GlowHerLogo />
                    <Button variant="ghost" onClick={() => router.push('/')} className="text-white hover:bg-white/10 hover:text-white">
                        <ChevronLeft className="mr-2 h-4 w-4" />Back to Dashboard
                    </Button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="text-center mb-8"><h1 className="font-headline text-4xl md:text-5xl font-bold text-white">Groceries</h1><p className="mt-2 text-lg text-white/80">Manage your pantry and plan your shopping.</p></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg sticky top-8 bg-black/20 backdrop-blur-sm border-white/20 text-white">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Plus/> {editingItem ? 'Edit Item in Inventory' : 'Add to Inventory'}</CardTitle></CardHeader>
                            <CardContent><Form {...inventoryForm}><form onSubmit={inventoryForm.handleSubmit(onInventorySubmit)} className="space-y-4">
                                <FormField control={inventoryForm.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-white">Item Name</FormLabel><FormControl><Input placeholder="e.g., Almond Milk" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={inventoryForm.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-white">Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => (<SelectItem key={cat.name} value={cat.name}><div className="flex items-center gap-2"><cat.icon className="h-4 w-4" />{cat.name}</div></SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                <FormField control={inventoryForm.control} name="quantity" render={({ field }) => (<FormItem><FormLabel className="text-white">Quantity (Optional)</FormLabel><FormControl><Input placeholder="e.g., 1 carton" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={inventoryForm.control} name="storageLocation" render={({ field }) => (<FormItem><FormLabel className="text-white">Storage Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select a location" /></SelectTrigger></FormControl><SelectContent>{storageLocations.map(loc => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                <FormField control={inventoryForm.control} name="expiryDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="text-white">Expiry Date (Optional)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:text-white hover:bg-white/20", !field.value && "text-slate-400")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                <Button type="submit" className="w-full bg-primary text-primary-foreground">{editingItem ? 'Update Item' : 'Add to Inventory'}</Button>
                                {editingItem && <Button type="button" variant="ghost" className="w-full text-white" onClick={() => { setEditingItem(null); inventoryForm.reset({ name: "", category: "Other", quantity: "", storageLocation: "Pantry" }); }}>Cancel Edit</Button>}
                            </form></Form></CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        {visibleExpiredItems.length > 0 && (
                            <Alert variant="destructive" className="relative bg-red-600 border-red-700 text-white [&>svg]:text-white">
                                 <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="font-bold">You have {visibleExpiredItems.length} expired item(s)!</AlertTitle>
                                <AlertDescription className="text-white pr-8">Check the expired tab: {visibleExpiredItems.map(item => item.name).join(', ')}.</AlertDescription>
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-white hover:text-white hover:bg-black/20" onClick={() => setDismissedExpiredIds(expiredItems.map(i => i.id))}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </Alert>
                        )}
                        {expiringItems.length > 0 && (<Alert className="bg-orange-500 border-orange-600 text-white [&>svg]:text-white"><AlertTriangle className="h-4 w-4" /><AlertTitle className="font-bold">Expiring Soon!</AlertTitle><AlertDescription className="text-white">Don't forget to use: {expiringItems.map(item => item.name).join(', ')}.</AlertDescription></Alert>)}
                        
                        <Tabs defaultValue="inventory" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-black/20 text-white text-xs sm:text-sm">
                                <TabsTrigger value="inventory" className="data-[state=active]:bg-white/20">My Groceries</TabsTrigger>
                                <TabsTrigger value="shoppingList" className="data-[state=active]:bg-white/20">Shopping List <Badge variant="secondary" className="ml-1 sm:ml-2 bg-primary text-primary-foreground">{shoppingList.length}</Badge></TabsTrigger>
                                <TabsTrigger value="used" className="data-[state=active]:bg-white/20">Used</TabsTrigger>
                                <TabsTrigger value="expired" className="data-[state=active]:bg-white/20">Expired <Badge variant="destructive" className="ml-1 sm:ml-2">{expiredItems.length}</Badge></TabsTrigger>
                            </TabsList>
                            <TabsContent value="inventory">
                                <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <CardTitle className="text-white">Your Inventory</CardTitle>
                                            <div className="flex gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="outline" className="bg-transparent hover:bg-white/10 border-white/30 text-white"><SortAsc className="mr-2 h-4 w-4" />Sort By</Button></DropdownMenuTrigger>
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
                                            <Button size="sm" variant={filter === 'All' ? 'secondary' : 'outline'} className="bg-transparent hover:bg-white/10 border-white/30 text-white data-[state=active]:bg-white/20" onClick={() => setFilter('All')}>All</Button>
                                            {categories.map(cat => (<Button key={cat.name} size="sm" variant={filter === cat.name ? 'secondary' : 'outline'} className="bg-transparent hover:bg-white/10 border-white/30 text-white data-[state=active]:bg-white/20" onClick={() => setFilter(cat.name)}><cat.icon className="mr-2 h-4 w-4" />{cat.name}</Button>))}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {activeInventory.length > 0 ? (
                                        <ul className="space-y-4">
                                            {activeInventory.map(item => {
                                                const isExpiring = expiringItems.some(expItem => expItem.id === item.id);
                                                const isExpired = expiredItems.some(expItem => expItem.id === item.id);
                                                const CategoryIcon = getCategoryIcon(item.category);
                                                return (
                                                <li key={item.id} className={cn("flex items-start gap-4 p-4 rounded-lg transition-all border", isExpiring ? "bg-orange-600/50 border-orange-500" : "border-white/20", isExpired ? "bg-red-600/50 border-red-500" : "bg-black/20 border-white/20")}>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Checkbox id={`check-${item.id}`} className="mt-1 border-white/50 data-[state=checked]:bg-primary" disabled={isExpired} />
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will mark "{item.name}" as used and move it to your history. Are you sure?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => markAsUsed(item.id)}>Yes, Mark as Used</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <div className="flex-grow">
                                                        <label htmlFor={`check-${item.id}`} className={cn("font-medium text-lg text-white", isExpired && "cursor-not-allowed")}>{item.name}</label>
                                                        <div className="text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                            <Badge variant="outline" className="flex items-center gap-1 border-white/30 text-white"><CategoryIcon className="h-3 w-3" />{item.category}</Badge>
                                                            {item.quantity && <Badge variant="outline" className="flex items-center gap-1 border-white/30 text-white"><Package className="h-3 w-3"/>{item.quantity}</Badge>}
                                                            {item.storageLocation && <Badge variant="outline" className="border-white/30 text-white">{item.storageLocation}</Badge>}
                                                            {item.expiryDate && isValid(item.expiryDate) && (<span className={cn("flex items-center gap-1 text-white", (isExpiring || isExpired) && "font-semibold", isExpired ? "text-red-300" : "text-orange-300")}><AlertTriangle className={cn("h-4 w-4", !(isExpiring || isExpired) && "hidden", isExpired && "text-red-300")} />Expires: {format(item.expiryDate, 'MMM d')}</span>)}
                                                        </div>
                                                    </div>
                                                    <div className="hidden md:flex gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="text-white hover:text-white hover:bg-white/10"><Edit className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteInventoryItem(item.id)} className="text-red-400 hover:text-red-400 hover:bg-white/10"><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                    <div className="md:hidden">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10"><MoreVertical className="h-4 w-4"/></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onSelect={() => handleEditClick(item)}>Edit</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => deleteInventoryItem(item.id)} className="text-red-500">Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </li>
                                                )})}
                                        </ul>
                                        ) : (<p className="text-center text-slate-400 py-8">{inventoryList.length === 0 ? "Your inventory is empty. Add an item to get started!" : `No items in the "${filter}" category.`}</p>)}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="shoppingList">
                                <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-white">Shopping List</CardTitle>
                                        <CardDescription className="text-slate-300">Add items you need to buy on your next trip.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...shoppingListForm}>
                                            <form onSubmit={shoppingListForm.handleSubmit(onShoppingListSubmit)} className="flex items-center gap-2 mb-6">
                                                <FormField control={shoppingListForm.control} name="name" render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="e.g., Bananas" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" /></FormControl><FormMessage /></FormItem>)}/>
                                                <Button type="submit"><Plus className="h-4 w-4 mr-2" />Add</Button>
                                            </form>
                                        </Form>

                                        {shoppingList.length > 0 ? (
                                            <ul className="space-y-2">
                                                {shoppingList.map(item => (
                                                    <li key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/10">
                                                        <span className="font-medium text-white">{item.name}</span>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => moveShoppingItemToInventory(item)} className="text-sky-400 hover:text-sky-300 hover:bg-black/20">
                                                                <span className="hidden md:inline">Move to Inventory</span> <ArrowRight className="h-4 w-4 md:ml-2"/>
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => deleteShoppingListItem(item.id)} className="text-red-400 hover:text-red-400 hover:bg-black/20">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-slate-400 py-8">Your shopping list is empty.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                             <TabsContent value="used">
                                <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-white">Used Items</CardTitle>
                                        <CardDescription className="text-slate-300">Items you've already used.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {usedInventory.length > 0 ? (
                                            <ul className="space-y-4">
                                                {usedInventory.map(item => {
                                                    const CategoryIcon = getCategoryIcon(item.category);
                                                    const isExpiring = item.expiryDate && isValid(item.expiryDate) && isWithinInterval(item.expiryDate, { start: addDays(new Date(), 1), end: addDays(new Date(), 10) });
                                                    return (
                                                        <li key={item.id} className={cn("flex items-center gap-4 p-4 rounded-lg bg-black/10 opacity-70", isExpiring && "bg-orange-900/50 opacity-100")}>
                                                            <Check className="h-5 w-5 text-green-500" />
                                                            <div className="flex-grow">
                                                                <p className="font-medium text-lg line-through text-slate-400">{item.name}</p>
                                                                <div className="text-sm text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                                    <Badge variant="outline" className="flex items-center gap-1 border-white/30 text-white"><CategoryIcon className="h-3 w-3" />{item.category}</Badge>
                                                                    {item.expiryDate && isValid(item.expiryDate) && (<span className={cn("flex items-center gap-1", isExpiring && "text-orange-300 font-semibold")}><AlertTriangle className={cn("h-4 w-4", !isExpiring && "hidden")} />Expires: {format(item.expiryDate, 'MMM d')}</span>)}
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" onClick={() => deleteInventoryItem(item.id)} className="text-red-400 hover:text-red-400 hover:bg-white/10"><Trash2 className="h-4 w-4" /></Button>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        ) : (<p className="text-center text-slate-400 py-8">No used items yet.</p>)}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="expired">
                                <Card className="shadow-lg bg-black/20 backdrop-blur-sm border-white/20 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-white">Expired Items</CardTitle>
                                        <CardDescription className="text-slate-300">These items are past their expiry date.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {expiredItems.length > 0 ? (
                                        <ul className="space-y-4">
                                            {expiredItems.map(item => {
                                                const CategoryIcon = getCategoryIcon(item.category);
                                                return (
                                                <li key={item.id} className="flex items-start gap-4 p-4 rounded-lg bg-red-900/50">
                                                    <div className="flex-grow">
                                                        <p className={cn("font-medium text-lg text-white", item.used && "line-through text-slate-400")}>{item.name}</p>
                                                        <div className="text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                            <Badge variant="outline" className="flex items-center gap-1 border-white/30 text-white"><CategoryIcon className="h-3 w-3" />{item.category}</Badge>
                                                            {item.quantity && <Badge variant="outline" className="flex items-center gap-1 border-white/30 text-white"><Package className="h-3 w-3"/>{item.quantity}</Badge>}
                                                            {item.expiryDate && isValid(item.expiryDate) && (<span className="flex items-center gap-1 text-red-300 font-semibold"><AlertTriangle className="h-4 w-4" />Expired: {format(item.expiryDate, 'MMM d')}</span>)}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {!item.archived && <Button variant="ghost" size="icon" title="Hide from inventory" onClick={() => archiveItem(item.id)} className="text-yellow-400 hover:text-yellow-300 hover:bg-white/10"><EyeOff className="h-4 w-4" /></Button>}
                                                        <Button variant="ghost" size="icon" title="Delete permanently" onClick={() => deleteInventoryItem(item.id)} className="text-red-400 hover:text-red-400 hover:bg-white/10"><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                </li>
                                                )})}
                                        </ul>
                                        ) : (<p className="text-center text-slate-400 py-8">You have no expired items. Great job!</p>)}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
