import { BrowserRouter, Routes, Route } from "react-router-dom";
import Authpage from "./pages/Authpage";
import Gamepage from "./pages/Gamepage";
import Historypage from "./pages/Historypage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Authpage />} />
        <Route path="/game" element={<Gamepage />} />
        <Route path="/history" element={<Historypage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
