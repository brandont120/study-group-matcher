import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Connections from "./pages/Connections";
import Groups from "./pages/Groups";
import Messages from "./pages/Messages";

export default function App(){
  return(
    <Router>
      <Navbar />
      <Routes>
        <Route path = "/" element = {<Home />}/>
        <Route path = "/connections" element = {<Connections />}/>
        <Route path="/groups" element={<Groups />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}
