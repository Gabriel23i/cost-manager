import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { useFormik } from "formik"
import { toast } from 'react-toastify'

import { registerSchema } from "../../../schema/register"
import { axios } from '../../../api/axios'
import { URLS } from '../../../api/urls'

import Input from '../../form/input/Input'
import Select from '../../form/select/Select'
import SubmitButton from '../../form/submitButton/SubmitButton'

import style from './ProjectForm.module.css'

function ProjectForm({ projectData, btnText, handlePost }){
    const [categories, setCategories] = useState([]);
    const [project] = useState(projectData);
    
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues:{
            name:project ? project.name : '',
            budget:project ? project.budget : '',
            category:project ? project.category.id : ''
        },
        onSubmit:(values)=>{

            const category = categories.find(categorie => categorie.id.toString() === values.category.toString())
            values.category = category
            
            // Edit project this block 'if'
            if(projectData){
                const ID = project.id
                const cost = project.cost
                const services  = project.services
                values.id = ID
                values.cost = cost
                values.services = services
                if(values.budget < values.cost){
                    toast.error('O orçamento não pode ser menor que o custo do projeto!')
                    return false
                }
                return handlePost(values)
            } //Important for edit the project !!!

            values.cost = 0
            values.services=[]

            axios.post(URLS.projects, values)
            .then(() => {
                toast.success('Projeto criado com sucesso!')
                navigate('/projects')
            })
            .catch(error =>{
                toast.error('Erro ao tentar criar projeto.')
                console.error(error)
            })
        },
        validationSchema:registerSchema
    });

    useEffect(()=>{
        axios.get(URLS.categories)
        .then((response)=>setCategories(response.data))
        .catch(error => console.error(error))
    },[])

    return(
        <form onSubmit={formik.handleSubmit} className={style.form}>
            <Input
                type="text"
                text="Nome do projeto"
                name="name"
                placeholder="Insira o nome do projeto"
                handleOnChange={formik.handleChange}
                value={formik.values.name}
                error={formik.errors.name && formik.touched.name && <>{formik.errors.name}</>}
            />
            <Input
                type="number"
                text="Orçamento do projeto"
                name="budget"
                placeholder="Insira o orçamento total"
                handleOnChange={formik.handleChange}
                value={formik.values.budget}
                error={formik.errors.budget && formik.touched.budget && <>{formik.errors.budget}</>}
            />
            <Select
                name="category"
                text="Categoria do projeto"
                options={categories}
                handleOnChange={formik.handleChange}
                value={formik.values.category}
                error={formik.errors.category && formik.touched.category && <>{formik.errors.category}</>}
            />
            <div>
                <SubmitButton text={btnText} />
            </div>
        </form>
    )
}

export default ProjectForm
