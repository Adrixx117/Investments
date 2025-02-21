import * as Yup from "yup";
import { useState, useEffect } from "react";
import './App.css';  // Importamos el archivo CSS

const investmentSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es obligatorio"),
  dividend: Yup.number().nullable().min(0, "Debe ser un número positivo o nulo").typeError("Debe ser un número"), 
  price: Yup.number().required("El precio es obligatorio").min(0, "Debe ser un número positivo").typeError("Debe ser un número"),
  quantity: Yup.number().required("La cantidad es obligatoria").min(1, "Debe ser al menos 1").typeError("Debe ser un número"),
});

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
  
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState('etf');

  // Cargar las inversiones desde el localStorage al cargar la aplicación
  useEffect(() => {
    const savedInvestments = JSON.parse(localStorage.getItem("investments")) || [];
    setInvestments(savedInvestments);
  }, []);

  // Guardar las inversiones en localStorage cada vez que cambien
  useEffect(() => {
    if (investments.length > 0) {
      localStorage.setItem("investments", JSON.stringify(investments));
    }
  }, [investments]);

  // Agregar una nueva inversión
  const addInvestment = async () => {
    try {
      const validatedInvestment = {
        ...newInvestment,
        dividend: newInvestment.dividend ? parseFloat(newInvestment.dividend) : null,  
        price: parseFloat(newInvestment.price),  
        quantity: parseFloat(newInvestment.quantity),  
      };
      await investmentSchema.validate(validatedInvestment);  
      const updatedInvestments = [...investments, validatedInvestment];
      setInvestments(updatedInvestments);
      setNewInvestment({ type: "etf", name: "", dividend: "", price: "", quantity: "" });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Eliminar una inversión
  const removeInvestment = (index) => {
    const updatedInvestments = investments.filter((_, i) => i !== index);
    setInvestments(updatedInvestments);
  };

  // Editar una inversión
  const editInvestment = (index, updatedInvestment) => {
    const updatedInvestments = investments.map((inv, i) => (i === index ? updatedInvestment : inv));
    setInvestments(updatedInvestments);
  };

  // Filtrar inversiones por tipo (ETF o Acción)
  const filterInvestments = (type) => investments.filter((inv) => inv.type === type);

  // Función para manejar el cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container p-5">
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
            <button className="btn btn-primary w-100" onClick={addInvestment}>
              Agregar
            </button>
          </div>
        </div>
      </div>

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
          <div className={`tab-pane fade ${activeTab === 'etf' ? 'show active' : ''}`} id="etf">
            <InvestmentTable investments={filterInvestments("etf")} onRemove={removeInvestment} onEdit={editInvestment} />
          </div>
          <div className={`tab-pane fade ${activeTab === 'accion' ? 'show active' : ''}`} id="accion">
            <InvestmentTable investments={filterInvestments("accion")} onRemove={removeInvestment} onEdit={editInvestment} />
          </div>
        </div>
      </div>
    </div>
  );
}

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
              <button className="btn btn-danger me-2" onClick={() => onRemove(index)}>Eliminar</button>
              <button className="btn btn-warning" onClick={() => onEdit(index, { ...inv, name: prompt("Nuevo nombre", inv.name) || inv.name })}>Editar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
