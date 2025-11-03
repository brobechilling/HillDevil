import { useSessionStore } from "@/store/sessionStore";
import { MenuManagement } from "@/components/waiter/MenuManagement";
import { Card, CardContent } from "@/components/ui/card";

const MenuPage = () => {
  const user = useSessionStore((state) => state.user);

  const branchId =
    (user as any)?.branchId ||
    (user as any)?.branch?.branchId ||
    (user as any)?.restaurantBranchId ||
    null;

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          You must be logged in to view this page.
        </CardContent>
      </Card>
    );
  }

  if (!branchId) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No branch information found in session.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Branch Menu</h2>
      <MenuManagement branchId={branchId} />
    </div>
  );
};

export default MenuPage;
