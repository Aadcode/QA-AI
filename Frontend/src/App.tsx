import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import Chat from "./pages/Chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload></Upload>}></Route>
        <Route path="/Ask" element={<Chat></Chat>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
