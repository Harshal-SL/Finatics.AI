import { BackgroundPaths } from "@/components/ui/background-paths";
import { useNavigate } from "react-router-dom";

export function DemoBackgroundPaths() {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        // Navigate to login or dashboard
        navigate("/login");
    };

    return (
        <BackgroundPaths 
            title="Finatics AI" 
            buttonText="Get Started"
            onButtonClick={handleButtonClick}
        />
    );
}
