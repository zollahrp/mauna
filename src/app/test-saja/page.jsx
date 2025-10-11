"use client"
import axios from "axios";
import { useEffect, useState, } from "react";
import api from "@/lib/axios";
export default function TestSajaPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("/public/kamus");
      console.log(response.data);
      setData(response.data);
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}