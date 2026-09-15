import { Router } from "./routes/route";
import { Toaster } from "@/components/ui/toaster";
import './styles/index.css'
import './styles/calendar.css'

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
