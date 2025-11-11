import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function CreateWish() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    stakeAmount: "",
    deadline: "",
    validatorMode: "community",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('jwt')
    if (!token) return alert('Not authenticated')

    const data = {
      ...form,
      stakeAmount: parseInt(form.stakeAmount) * 1000000000, // to nanotons
      deadline: new Date(form.deadline).toISOString()
    }

    try {
      await api.wish.create(data, token)
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

export default CreateWish;
