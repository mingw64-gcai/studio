
'use client';

import { Sidebar } from '@/components/sidebar';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const { toast } = useToast();

    const handleEditClick = () => {
        toast({
            title: "Feature Coming Soon",
            description: "Profile editing functionality will be available in a future update.",
        });
    }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <Sidebar isSheet={true} />
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">User Profile</h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Admin Profile</CardTitle>
                        <CardDescription>Manage your profile and account settings.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleEditClick}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                </div>
                </CardHeader>
                <CardContent>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarFallback
                            className="text-4xl"
                            style={{ backgroundColor: "#34A853", color: "white" }}
                            >
                            AD
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Admin</h2>
                            <p className="text-muted-foreground">Administrator</p>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                         <div>
                            <h3 className="text-lg font-semibold">Account Details</h3>
                            <Separator className="my-2" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="font-semibold">Email:</div>
                                <div>admin@drishti.ai</div>
                                <div className="font-semibold">Username:</div>
                                <div>admin</div>
                                <div className="font-semibold">Member Since:</div>
                                <div>July 2024</div>
                                <div className="font-semibold">Last Login:</div>
                                <div>{new Date().toLocaleString()}</div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Permissions</h3>
                             <Separator className="my-2" />
                             <div className="flex flex-wrap gap-2 text-sm">
                                <span className="bg-primary/20 text-primary-foreground-dark px-3 py-1 rounded-full">Full Access</span>
                                <span className="bg-primary/20 text-primary-foreground-dark px-3 py-1 rounded-full">System Configuration</span>
                                <span className="bg-primary/20 text-primary-foreground-dark px-3 py-1 rounded-full">User Management</span>
                                <span className="bg-primary/20 text-primary-foreground-dark px-3 py-1 rounded-full">Alerts Monitoring</span>
                             </div>
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
