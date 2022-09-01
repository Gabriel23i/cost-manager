import { parse, v4 as uuidv4 } from 'uuid'
import {  useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import Loading from '../layout/Loading'
import Container from '../layout/Container'
import ProjectForm from '../project/ProjectForm'
import ServiceForm from '../services/ServiceForm'
import ServiceCard from '../services/ServiceCard'
import LinkButton from '../layout/LinkButton'

import styles from './Project.module.css'

function Project(){
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [project, setProject] = useState([])
  const [services, setServices] = useState([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)

  useEffect(()=>{
    setTimeout(()=>{
      fetch(`http://localhost:5000/projects/${id}`, {
        method:"GET",
        headers:{
          "Content-Type":"application/json",
        },
      })
      .then(response => response.json())
      .then(data =>{
        setProject(data)
        setServices(data.services)
      })
      .catch(error => console.error(error))  
    },300)
  },[id])

  function editPost(project){    
    fetch(`http://localhost:5000/projects/${id}`,{
      method: "PATCH",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify(project),
    })
    .then(response => response.json())
    .then(data => {
      setProject(data)
      setShowProjectForm(false)
      navigate('/projects')
      toast.success('Projeto atualizado!')
    })
    .catch(error => {
      toast.error('Erro ao atualizar projeto!')
      console.error(error)
    })
  }

  function createService(project){
    //Last service
    const lastService = project.services[project.services.length - 1]
    
    lastService.id = uuidv4()

    const lastServiceCost = lastService.cost 
    
    const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost)

    // maximum value validation
    if(newCost > parseFloat(project.budget)){
      toast.error('Orçamento ultrapassado, verifique o valor do serviço.')
      project.services.pop()
      return false
    }

    // add service cost to project total cost
    project.cost = newCost

    //update project 
    fetch(`http://localhost:5000/projects/${project.id}`,{
      method:"PATCH",
      headers:{
        "Content-Type":"application/json",
      },
      body: JSON.stringify(project)
    })
    .then(response => response.json())
    .then(() => {
      setShowServiceForm(false)
      toast.success('Serviço criado com sucesso!')
    })
    .catch(error => {
      toast.error('Erro na criação do serviço.')
      console.error(error)
    })
  }

  function removeService(id, cost){
    const servicesUpdated = project.services.filter(
      (service) => service.id !== id
    );

    const projectUpdated = project

    projectUpdated.services = servicesUpdated
    projectUpdated.cost = parseFloat(projectUpdated.cost) - parseFloat(cost)

    fetch(`http://localhost:5000/projects/${projectUpdated.id}`, {
      method: "PATCH",
      headers:{
        "Content-Type":"application/json"
      },
      body:
        JSON.stringify(projectUpdated)
    })
    .then(response => response.json())
    .then(() => {
      setProject(projectUpdated)
      setServices(servicesUpdated)
      toast.success('Serviço removido com sucesso!')
    })
    .catch(error => {
      toast.error('Erro na remoção do serviço.')
      console.error(error)
    })
  }

  function toggleProjectForm(){
    setShowProjectForm(!showProjectForm)
  }

  function toggleServiceForm(){
    setShowServiceForm(!showServiceForm)
  }

  return(
    <>
    {project.name ? (
      <div className={styles.project_details}>
        <Container customClass="column">
          <div className={styles.details_container}>
            <h1>Projeto: {project.name}</h1>
            <button
              className={styles.btn}
              onClick={toggleProjectForm}
            >
              {!showProjectForm ? 'Editar projeto' : 'Fechar'}
            </button>
            {!showProjectForm ? (
              <div className={styles.project_info}>
                <p>
                  <span>Categoria:</span> {project.category.name}
                </p>
                <p>
                  <span>Total de Orçamento:</span> R${project.budget}
                </p>
                <p>
                  <span>Total Utilizado:</span> R${project.cost}
                </p>
              </div>
            ) : (
              <div className={styles.project_info}>
                <ProjectForm
                  handlePost={editPost}
                  btnText="Concluir edição"
                  projectData={project}
                />
              </div>
            )}
          </div>
          <div className={styles.service_form_container}>
            <h2>Adicione um serviço:</h2>
            <button
              className={styles.btn}
              onClick={toggleServiceForm}
            >
              {!showServiceForm ? 'Adicionar serviço' : 'Fechar'}
            </button>
            <div className={styles.project_info}>
              {showServiceForm &&
                <ServiceForm
                  handleSubmit={createService}
                  btnText="Adicionar Serviço"
                  projectData={project}
                />
              }
            </div>
          </div>
          <h2>Serviços</h2>
          <Container customClass="start">
            {services.length > 0 && 
              services.map(service =>(
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  cost={service.cost}
                  description={service.description}
                  handleRemove={removeService}
                />
              ))
            }
            {services.length === 0 && <p>Não há serviços cadastrados.</p>}
          </Container>
            <div className={styles.finalizar}> 
              <LinkButton to="/projects" text="Finalizar edição"/>
            </div>
        </Container>
      </div>
      ) : (<Loading />)
    }
    </>
  )
}

export default Project
