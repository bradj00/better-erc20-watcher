import logo from './logo.svg';
import './App.css';
import Dashboard from './dashboard/Dashboard';

function App() {
  return (
    <div  style={{backgroundColor:'#333',position:'absolute', width:'100vw', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'1vw', color:'#fff'}}>
      <Dashboard />
    </div>
  );
}

export default App;
