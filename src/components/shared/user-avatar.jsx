import useAuth from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const UserAvatar = () => {
  const navigate = useNavigate();
  const { user, isAuth } = useAuth();

  if (!isAuth) return null;
  return (
    <button
      className="flex items-center justify-center space-x-2 cursor-pointer"
      onClick={() => {
        if (user.role === "Admin") navigate("/dashboard/profile");
        else navigate("/profile");
      }}
    >
      <Avatar className="flex items-center justify-center size-6">
        <AvatarImage src={user?.avatar?.url} alt="profile-picture" />
        <AvatarFallback className="flex bg-foreground items-center text-sm justify-center w-full h-full text-card">
          {user?.fullName[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-card-foreground text-sm font-medium">
        {user?.fullName}
      </span>
    </button>
  );
};

export default UserAvatar;
