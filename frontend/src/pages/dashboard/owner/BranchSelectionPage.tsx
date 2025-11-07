import { BranchDTO } from "@/dto/branch.dto";
import { RestaurantDTO } from "@/dto/restaurant.dto";
import { getLocalStorageObject } from "@/utils/typeCast";
import { useNavigate } from "react-router-dom";
import { BranchSelection } from "@/components/common/BranchSelection";
import { useEffect, useState } from "react";

export default function BranchSelectionPage() {
    const navigate = useNavigate();
    const selectedRestaurant: RestaurantDTO | null = getLocalStorageObject<RestaurantDTO>("selected_restaurant");
    const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!selectedRestaurant) {
            navigate('/brand-selection');
        }
    }, [selectedRestaurant, navigate]);

    const handleAccessManagerDashboard = (selectedBranch: BranchDTO) => {
        // Save selected branchId to sessionStorage for persistence across navigation
        if (selectedBranch?.branchId) {
            sessionStorage.setItem('owner_selected_branch_id', String(selectedBranch.branchId));
        }
        // temporary allow access to staff page in manager dashboard
        navigate("/dashboard/manager/staff", {
            state: {
                branchId: selectedBranch?.branchId
            },
        });
    };

    const handleSelectBranch = (branch: BranchDTO) => {
        setSelectedBranchId(String(branch.branchId));
        handleAccessManagerDashboard(branch);
    };

    if (!selectedRestaurant) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Branch Selection</h2>
                <p className="text-muted-foreground">Select a branch to access manager dashboard of the branch</p>
            </div>
            <BranchSelection
                restaurantId={selectedRestaurant.restaurantId}
                selectedBranchId={selectedBranchId}
                onSelectBranch={handleSelectBranch}
                variant="full"
                showFullDetails={true}
                title="Branch Selection"
                description="Select a branch to access manager dashboard of the branch"
            />
        </div>
    );
}