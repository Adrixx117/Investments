/**
 * The InvestmentTracker component in JavaScript allows users to add, track, edit, and remove
 * investments, with validation using Yup, and displays investments in a table based on type (ETF or
 * Stock).
 * @returns The `InvestmentTracker` component is being returned, which contains the form to add new
 * investments, tabs to switch between ETFs and Stocks, and a table to display and manage the
 * investments. The component also includes functions to add, remove, and edit investments, as well as
 * validation using Yup schema.
 */
import * as Yup from "yup";  // Importa Yup para la validación de datos
import { useState, useEffect } from "react";  // Importa hooks de React
import './App.css';  // Importa los estilos CSS
import { db } from "./firebase";
import { addDoc, collection, doc, getDocs } from "firebase/firestore";

// Esquema de validación usando Yup
const investmentSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es obligatorio"),  // El nombre es obligatorio
  dividend: Yup.number().nullable().min(0, "Debe ser un número positivo o nulo").typeError("Debe ser un número"),  // El dividendo debe ser positivo o nulo
  price: Yup.number().required("El precio es obligatorio").min(0, "Debe ser un número positivo").typeError("Debe ser un número"),  // El precio es obligatorio y positivo
  quantity: Yup.number().required("La cantidad es obligatoria").min(1, "Debe ser al menos 1").typeError("Debe ser un número"),  // La cantidad es obligatoria y al menos 1
});

// Componente principal para el seguimiento de inversiones
export default function InvestmentTracker() {
  // Estado para las inversiones, para almacenar las nuevas y las cargadas desde localStorage
  const [investments, setInvestments] = useState([]);

  // Estado para los valores de una nueva inversión
  const [newInvestment, setNewInvestment] = useState({
    type: "etf",  // Tipo de inversión por defecto (ETF)
    name: "",  // Nombre de la inversión
    dividend: "",  // Dividendos de la inversión
    price: "",  // Precio de la inversión
    quantity: "",  // Cantidad de la inversión
  });

  // Estado para los mensajes de error
  const [error, setError] = useState("");

  // Estado para manejar la pestaña activa (ETF o Acción)
  const [activeTab, setActiveTab] = useState('etf');

  // useEffect para cargar las inversiones del localStorage al inicio
  useEffect(() => {
    obtenerEtfsFirebase();
    // const savedInvestments = JSON.parse(localStorage.getItem("investments")) || [];
    // setInvestments(savedInvestments);  // Asigna las inversiones cargadas al estado
  }, []);

  // useEffect para guardar las inversiones en el localStorage cuando cambien
  useEffect(() => {
    if (investments.length > 0) {
      localStorage.setItem("investments", JSON.stringify(investments));  // Guarda las inversiones en localStorage
    }
  }, [investments]);


const agregarAccionesFirebase= async(doc) => {
  try{
    await addDoc(collection(db, "Acciones"), doc);
  }catch(e){
    console.error(e);
  }
}
const agregarEtfsFirebase = async(doc) => {
  try{
    await addDoc(collection(db, "Etfs"), doc);
  }catch(e){
    console.error(e);
  }
}

const obtenerAccionesFirebase=async()=>{ //
  const querySnapshot = await getDocs(collection(db, "Acciones"));
  const datos = [];
  querySnapshot.forEach((doc) => {
    datos.push(doc.data());
  });
  setInvestments(datos);
}
const obtenerEtfsFirebase=async()=>{ //
  const querySnapshot = await getDocs(collection(db, "Etfs"));
  const datos = [];
  querySnapshot.forEach((doc) => {
  datos.push(doc.data());
  });
  setInvestments(datos);
}


  // Función para agregar una nueva inversión
  const addInvestment = async () => {

    console.log("Hola");

    try {
      // Convierte los valores de dividendos, precio y cantidad a números (si es necesario)
      const validatedInvestment = {
        ...newInvestment, //operador de deconstruir , haces una copia de ese objeto
        dividend: newInvestment.dividend ? parseFloat(newInvestment.dividend) : null,  // Si hay dividendos, los convierte a número
        price: parseFloat(newInvestment.price),  // Convierte el precio a número
        quantity: parseFloat(newInvestment.quantity),  // Convierte la cantidad a número
      };


      // Valida los datos usando Yup
      await investmentSchema.validate(validatedInvestment); 
      if(validatedInvestment.type === "etf"){
        agregarEtfsFirebase(validatedInvestment);
      }else{
        agregarAccionesFirebase(validatedInvestment);
      }
     
      // Si la validación es exitosa, agrega la inversión a la lista de inversiones
      const updatedInvestments = [...investments, validatedInvestment];
      setInvestments(updatedInvestments);

      // Resetea los campos del formulario
      setNewInvestment({ type: "etf", name: "", dividend: "", price: "", quantity: "" });
      setError("");  // Limpia cualquier error
    } catch (err) {
      // Si hay un error en la validación, muestra el mensaje de error
      setError(err.message);
    }
  };

  // Función para eliminar una inversión
  const removeInvestment = (index) => {
    // Filtra la inversión a eliminar según el índice
    const updatedInvestments = investments.filter((_, i) => i !== index);
    setInvestments(updatedInvestments);  // Actualiza el estado con la lista filtrada
  };

  // Función para editar una inversión
  const editInvestment = (index, updatedInvestment) => {
    // Actualiza la inversión en el índice especificado con los nuevos valores
    const updatedInvestments = investments.map((inv, i) => (i === index ? updatedInvestment : inv));
    setInvestments(updatedInvestments);  // Actualiza el estado con la inversión editada
  };

  // Filtra las inversiones por tipo (ETF o Acción)
  const filterInvestments = (type) => investments.filter((inv) => inv.type === type);

  // Función para manejar el cambio de pestaña (entre ETF y Acción)
  const handleTabChange = (tab) => {
    setActiveTab(tab);  // Cambia la pestaña activa (ETF o Acción)
    if (tab === "etf") {
      obtenerEtfsFirebase();

    }else{
      obtenerAccionesFirebase();
    }
  };

  return (
    <div className="container p-5">
      {/* Formulario para agregar una nueva inversión */}
      <div className="card mb-4 p-4 shadow-sm">
        <h2 className="card-header">Añadir Inversión</h2>
        {/* Muestra un mensaje de error si existe */}
        {error && <p className="text-danger">{error}</p>}
        <div className="row g-3">
          {/* Selector para elegir el tipo de inversión (ETF o Acción) */}
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
          {/* Campo para ingresar el nombre de la inversión */}
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Nombre"
              value={newInvestment.name}
              onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
            />
          </div>
          {/* Campo para ingresar los dividendos */}
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
          {/* Campo para ingresar el precio */}
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
          {/* Campo para ingresar la cantidad */}
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
          {/* Botón para agregar la inversión */}
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={addInvestment}>
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas para cambiar entre ETF y Acción */}
      <div className="tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === 'etf' ? 'active' : ''}`}
              onClick={() => handleTabChange('etf')}
              href="#etf"
            >
              ETFs
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === 'accion' ? 'active' : ''}`}
              onClick={() => handleTabChange('accion')}
              href="#accion"
            >
              Acciones
            </a>
          </li>
        </ul>
        <div className="tab-content mt-3">
          {/* Muestra las inversiones de tipo ETF */}
          <div className={`tab-pane fade ${activeTab === 'etf' ? 'show active' : ''}`} id="etf">
            <InvestmentTable investments={filterInvestments("etf")} onRemove={removeInvestment} onEdit={editInvestment} />
          </div>
          {/* Muestra las inversiones de tipo Acción */}
          <div className={`tab-pane fade ${activeTab === 'accion' ? 'show active' : ''}`} id="accion">
            <InvestmentTable investments={filterInvestments("accion")} onRemove={removeInvestment} onEdit={editInvestment} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente que muestra las inversiones en una tabla
function InvestmentTable({ investments, onRemove, onEdit }) {
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
        {investments.map((inv, index) => (
          <tr key={index}>
            <td>{inv.name}</td>
            <td>{inv.dividend}</td>
            <td>{inv.price}</td>
            <td>{inv.quantity}</td>
            <td>
              {/* Botón para eliminar una inversión */}
              <button className="btn btn-danger me-2" onClick={() => onRemove(index)}>Eliminar</button>
              {/* Botón para editar una inversión */}
              <button className="btn btn-warning" onClick={() => onEdit(index, { ...inv, name: prompt("Nuevo nombre", inv.name) || inv.name })}>Editar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
