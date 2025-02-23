/**
 * InvestmentTracker: Permite agregar, editar y eliminar inversiones (ETFs y Acciones).
 * Se almacenan en Firebase y se validan con Yup.
 */
import * as Yup from "yup";
import { useState, useEffect } from "react";
import './App.css';
import { db } from "./firebase";
import { addDoc, collection, doc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";

// Esquema de validación con Yup
const investmentSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es obligatorio"),
  dividend: Yup.number().nullable().min(0, "Debe ser un número positivo o nulo").typeError("Debe ser un número"),
  price: Yup.number().required("El precio es obligatorio").min(0, "Debe ser un número positivo").typeError("Debe ser un número"),
  quantity: Yup.number().required("La cantidad es obligatoria").min(1, "Debe ser al menos 1").typeError("Debe ser un número"),
});

// Componente principal
export default function InvestmentTracker() {
  const [investments, setInvestments] = useState([]);
  const [newInvestment, setNewInvestment] = useState({
    type: "etf",
    name: "",
    dividend: "",
    price: "",
    quantity: "",
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("etf");

  // Cargar inversiones desde Firebase al inicio
  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerEtfsFirebase();
      await obtenerAccionesFirebase();
    };
    cargarDatos();
  }, []);

  // Función para obtener ETFs desde Firebase
  const obtenerEtfsFirebase = async () => {
    const querySnapshot = await getDocs(collection(db, "Etfs"));
    const datos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setInvestments((prev) => [...prev.filter((inv) => inv.type !== "etf"), ...datos]);
  };

  // Función para obtener Acciones desde Firebase
  const obtenerAccionesFirebase = async () => {
    const querySnapshot = await getDocs(collection(db, "Acciones"));
    const datos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setInvestments((prev) => [...prev.filter((inv) => inv.type !== "accion"), ...datos]);
  };

  // Agregar inversión a Firebase
  const addInvestment = async () => {
    try {
      const validatedInvestment = {
        ...newInvestment,
        dividend: newInvestment.dividend ? parseFloat(newInvestment.dividend) : null,
        price: parseFloat(newInvestment.price),
        quantity: parseFloat(newInvestment.quantity),
      };

      await investmentSchema.validate(validatedInvestment);

      const collectionName = validatedInvestment.type === "etf" ? "Etfs" : "Acciones";
      const docRef = await addDoc(collection(db, collectionName), validatedInvestment);

      setInvestments([...investments, { id: docRef.id, ...validatedInvestment }]);
      setNewInvestment({ type: "etf", name: "", dividend: "", price: "", quantity: "" });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Eliminar inversión de Firebase
  const eliminarInversionFirebase = async (id, type) => {
    try {
      const docRef = doc(db, type === "etf" ? "Etfs" : "Acciones", id);
      await deleteDoc(docRef);
      console.log("Documento eliminado con éxito");
    } catch (e) {
      console.error("Error eliminando documento:", e);
    }
  };

  const removeInvestment = async (id, type) => {
    try {
      await eliminarInversionFirebase(id, type);
      const updatedInvestments = investments.filter((inv) => inv.id !== id);
      setInvestments(updatedInvestments);
    } catch (e) {
      console.error("Error eliminando inversión:", e);
    }
  };

  // Editar inversión en Firebase
  const editInvestment = async (id, updatedInvestment) => {
    try {
      const investmentRef = doc(db, updatedInvestment.type === "etf" ? "Etfs" : "Acciones", id);
      await updateDoc(investmentRef, updatedInvestment);
      setInvestments(investments.map((inv) => (inv.id === id ? { id, ...updatedInvestment } : inv)));
    } catch (error) {
      console.error("Error editando inversión:", error);
    }
  };

  // Cambiar entre pestañas y recargar datos
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === "etf") {
      await obtenerEtfsFirebase();
    } else {
      await obtenerAccionesFirebase();
    }
  };

  return (
    <div className="container p-5">
      {/* Título y descripción */}
      <div className="text-center mb-4">
        <h1 className="fw-bold" >Gestión de Inversiones</h1>
        <p className="text-muted2"><b>Administra tus inversiones de forma sencilla y eficiente. Agrega, edita o elimina tus ETFs y acciones con facilidad.</b></p>
      </div>
      
      <div className="card mb-4 p-4 shadow-sm">
        <h2 className="card-header">Añadir Inversión</h2>
        {error && <p className="text-danger">{error}</p>}
        <div className="row g-3">
          <div className="col-md-2">
            <select
              className="form-select"
              value={newInvestment.type}
              onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value })}
            >
              <option value="etf">ETF</option>
              <option value="accion">Acción</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Nombre"
              value={newInvestment.name}
              onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Dividendos"
              type="number"
              step="any"
              value={newInvestment.dividend}
              onChange={(e) => setNewInvestment({ ...newInvestment, dividend: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Precio"
              type="number"
              step="any"
              value={newInvestment.price}
              onChange={(e) => setNewInvestment({ ...newInvestment, price: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Cantidad"
              type="number"
              step="any"
              value={newInvestment.quantity}
              onChange={(e) => setNewInvestment({ ...newInvestment, quantity: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={addInvestment}>Agregar</button>
          </div>
        </div>
      </div>
  
      <div className="tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'etf' ? 'active' : ''}`} onClick={() => handleTabChange('etf')} href="#etf">ETFs</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'accion' ? 'active' : ''}`} onClick={() => handleTabChange('accion')} href="#accion">Acciones</a>
          </li>
        </ul>
        <InvestmentTable investments={investments.filter(inv => inv.type === activeTab)} onRemove={removeInvestment} onEdit={editInvestment} />
      </div>
    </div>
  );
  
  function InvestmentTable({ investments, onRemove }) {
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dividendos</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.name}</td>
              <td>{inv.dividend}</td>
              <td>{inv.price}</td>
              <td>{inv.quantity}</td>
              <td>
                <button className="btn btn-danger me-2" onClick={() => onRemove(inv.id, inv.type)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
