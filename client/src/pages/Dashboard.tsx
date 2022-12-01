import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

type Props = {};

const Dashboard = (props: Props) => {

  const [quote, setQuote] = useState<string>('')
  const [tempQuote, setTempQuote] = useState<string>('')

  async function populateQuote() {
    const req = await fetch("http://localhost:8000/quote", {
      headers: {
        "x-access-token": localStorage.getItem("token") || '',
      },
    });

    const data = await req.json();
    if(data.status === 'ok') setQuote(data.quote)
    else alert(data.error)
    console.log(data);
  }

  async function changeQuote(e:any){
    e.preventDefault()

    const req = await fetch("http://localhost:8000/quote", {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "x-access-token": localStorage.getItem("token") || '',
      },
      body: JSON.stringify({quote: tempQuote})
    });

    const data = await req.json();
    if(data.status === 'ok'){
      setTempQuote('')
      setQuote(data.quote)
    } else alert(data.error)
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user:string = jwtDecode(token);
      if (!user) {
        localStorage.removeItem("token");
        window.location.replace("/login");
      } else {
        populateQuote();
      }
    } else window.location.replace("/login");
  }, []);

  return(
    <div>
      <h1>Your quote: {quote || 'No quote found'}</h1>
      <form onSubmit={changeQuote}>
        <input type="text"  placeholder="Quote" value={tempQuote} onChange={(e) => setTempQuote(e.target.value)} />
        <input type="submit" value='Change Quote' />
      </form>
    </div>
    
  );
};

export default Dashboard;
