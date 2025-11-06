import { MenuManagement } from "@/components/waiter/MenuManagement";

const MenuPage = () => {

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Branch Menu</h2>
      <MenuManagement />
    </div>
  );
};

export default MenuPage;
