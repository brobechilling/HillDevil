import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchDTO } from "@/dto/branch.dto";
import { RestaurantDTO } from "@/dto/restaurant.dto";
import { useActiveBranchesByRestaurant } from "@/hooks/queries/useBranches";
import { getLocalStorageObject } from "@/utils/typeCast";
import { Building2 } from "lucide-react";
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";

export default function BranchSelectionPage() {
    const navigate = useNavigate();
    const selectedRestaurant: RestaurantDTO | null = getLocalStorageObject<RestaurantDTO>("selected_restaurant");
    if (!selectedRestaurant) {
        navigate('/brand-selection');
    }
    const { data: branches, isLoading: isBranchesLoading } = useActiveBranchesByRestaurant(selectedRestaurant?.restaurantId);

    const handleAccessManagerDashboard = (selectedBranch: BranchDTO) => {
        // Save selected branchId to sessionStorage for persistence across navigation
        if (selectedBranch?.branchId) {
            sessionStorage.setItem('owner_selected_branch_id', String(selectedBranch.branchId));
        }
        // temporary allow access to staff page in manager dashboard
        navigate("/dashboard/manager/overview", {
        state: {
            branchId: selectedBranch?.branchId
        },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-3xl font-bold mb-2">Branch Selection</h2>
                <p className="text-muted-foreground">Select a branch to access manager dashboard of the branch</p>
            </div>
            {isBranchesLoading && (
                <div className="text-center text-muted-foreground py-8">
                    Loading staff accounts...
                </div>
            )}
            {branches?.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No branch found.
                </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches?.map((branch) => (
                <Card
                    key={String(branch.branchId)}
                    className="cursor-pointer hover:border-primary transition-smooth"
                    onClick={() => handleAccessManagerDashboard(branch)}
                >
                <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    </div>
                    <CardTitle className="text-xl">{branch.address}</CardTitle>
                    <CardDescription>Phone: {branch.branchPhone || 'No phone'}</CardDescription>
                    <CardDescription>Email: {branch.mail || 'No mail'}</CardDescription>
                    <CardDescription>Opening time: {branch.openingTime || 'No opening time'}</CardDescription>
                    <CardDescription>Closing time: {branch.closingTime || 'No closing time'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" variant="outline">Access Manager Dashboard</Button>
                </CardContent>
                </Card>
            ))}
            </div>
        </motion.div>
    );

    
}