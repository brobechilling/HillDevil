import { MenuManagement } from '@/components/manager/MenuManagement';
import { useLocation } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';
import { isStaffAccountDTO } from '@/utils/typeCast';
import { StaffAccountDTO } from '@/dto/staff.dto';

export default function MenuPage() {
  const location = useLocation();
  const { user } = useSessionStore();
  
  // Get branchId from multiple sources (similar to StaffPage)
  // Get the branchId when the person access this page is the owner, this branchId is passed from BranchSelectionPage
  const { branchId: branchIdFromState } = location.state || {};
  // If the person access is the manager
  const manager: StaffAccountDTO | null = isStaffAccountDTO(user) ? user : null;
  const branchIdFromStore = manager?.branchId || "";
  // Try to get branchId from sessionStorage (for owner viewing as manager)
  const branchIdFromSession = sessionStorage.getItem('owner_selected_branch_id') || "";
  // Priority: state > store > sessionStorage
  const branchId: string = branchIdFromState || branchIdFromStore || branchIdFromSession;

  return (
    <div className="p-6">
      <MenuManagement branchId={branchId} />
    </div>
  );
}
