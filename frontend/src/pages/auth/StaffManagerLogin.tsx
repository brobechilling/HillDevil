import StaffLoginForm from '@/components/auth/StaffLoginForm';

const StaffManagerLoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md">
        <StaffLoginForm />
      </div>
    </div>
  );
};

export default StaffManagerLoginPage;
