import '../../App.css';
import {AppContext} from '../../App';
import React, {useState, useEffect, useContext, createContext} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap';
import TableToShow from "./TableToShow";
import {Container,Row,Col} from "react-bootstrap";
import '../General/first_row.css';


import "react-circular-progressbar/dist/styles.css";

import SelectMenu from "../SelectMenu/SelectMenu";
import SideBar from "../General/SideBar";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";


function ReportsStats() {


    const { showbar,username,tablerows,usecaseList,reports,languageList,instituteList } = useContext(AppContext);
    const [hiddenColumns,sethiddenColumns]  = useState([])
    const [UseCaseList,SetUseCaseList] = usecaseList;
    const [LanguageList,SetLanguageList] = languageList;
    const [InstituteList,SetInstituteList] = instituteList;
    const [Aux,SetAux] = useState(false)
    const [ShowBar,SetShowBar] = showbar;
    const [Username,SetUsername] = username;
    const [Reports,SetReports] = reports;
    // const [ShowStats,SetShowStats] = useState(new Array(usecaseList.length+1).fill(false))
    const [StatsArray,SetStatsArray] = useState(false)
    const [StatsArrayPercent,SetStatsArrayPercent] = useState(false)
    const [Options_uses,SetOptions_uses] = useState([])
    // const [Options_order,SetOptions_order] = useState([{value:'ID',label:'ID'},{value:'DESC',label:'Number of annotations (DESC)'},{value:'ASC',label:'Number of annotations (ASC)'}])
    const [Options_order,SetOptions_order] = useState([])
    const [Actions,SetActions] = useState(['Labels','Mentions','Concepts','Linking'])
    const [Use,SetUse] = useState('')
    const [Order,SetOrder] = useState('')
    const [Cols,SetCols] = useState([])
    const [data,setdata] = useState([])
    const [HiddenCols,SetHiddenCols] = useState([])
    const [rows, setRows] = useState([])
    // const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deletedRows, setDeletedRows] = useState([]);
    const [purgeMode, setPurgeMode] = useState(true);
    const [defaultColumnWidths,setdefaultColumnWidths] = useState([]);

    useEffect(()=>{
        var opt = []
        axios.get("get_usecase_inst_lang").then(response => {
            SetUseCaseList(response.data['usecase']);
            SetLanguageList(response.data['language']);
            SetInstituteList(response.data['institute']);
            response.data['usecase'].map((use,i)=>{
                opt.push(<option value={use}>{use}</option>)
                // opt.push({value:use,label:use})
            })
            SetOptions_uses(opt)

        })
            .catch(function(error){
                console.log('error: ',error)
            })

        var opt_ord = []
        var wd_col = []
        opt_ord.push(<option value='ID'>ID</option>)
        opt_ord.push(<option value='ASC'>Number of annotations (ASC)</option>)
        opt_ord.push(<option value='DESC'>Number of annotations (DESC)</option>)
        SetOptions_order(opt_ord)
        var username = window.username
        // console.log('username', username)
        SetUsername(username)
        var arr_data = []
        var col = []
        var hid_cols = []

        // col.push({name:'delete',width:100})
        // col.push({name:'download'})
        col.push({name:'id_report',title:'doc id'})
        wd_col.push({columnName:'id_report',width:150})
        col.push({name:'language',title:'language'})
        wd_col.push({columnName:'language',width:150})
        col.push({name:'batch',title:'batch'})
        wd_col.push({columnName:'batch',width:100})
        col.push({name:'topic',title:'topic'})
        wd_col.push({columnName:'topic',width:150})

        col.push({name:'institute',title:'institute'})
        wd_col.push({columnName:'institute',width:150})


        col.push({name:'annotations',title:'annotations'})
        wd_col.push({columnName:'annotations',width:150,align:'right'})

        // col.push({name:'labels',title:'labels'})
        // wd_col.push({columnName:'labels',width:150,align:'right'})
        // hid_cols.push('labels')
        //
        // col.push({name:'mentions',title:'mentions'})
        // wd_col.push({columnName:'mentions',width:150,align:'right'})
        // hid_cols.push('mentions')
        //
        // col.push({name:'concepts',title:'concepts'})
        // wd_col.push({columnName:'concepts',width:150,align:'right'})
        // hid_cols.push('concepts')
        //
        // col.push({name:'linking',title:'linking'})
        // wd_col.push({columnName:'linking',width:150,align:'right'})
        // hid_cols.push('linking')


        axios.get('get_fields',{params:{all:'all'}}).then(function (response){
            response.data['all_fields'].map((elem,ind)=>{
                var nome = elem + '_0'
                col.push({name:nome,title:elem})
                wd_col.push({columnName:nome,width:200})

                // col.push({Header:elem,accessor:elem})
                hid_cols.push(nome)
            })
            col.push({name:'',title:''})
            wd_col.push({columnName:'',width:200})


            SetCols(col)
            setdefaultColumnWidths(wd_col)
            SetHiddenCols(hid_cols)
        })

        axios.get('get_data',).then(function (response){
            response.data['reports'].map((elem,ind)=>{
                arr_data.push(
                    {
                        id:ind,annotations: elem['total'],
                        ...elem['report']

                    }
                )
            })
            setdata(arr_data)
            setRows(arr_data)
        })


        // MODIFIED BY ORNELLA 04082021
        // axios.get("get_reports", {params: {configure: 'configure'}}).then(response => {
        //     SetReports(response.data['report']);
        //
        // })

    },[])

    useEffect(()=>{
        console.log('righe',rows)
    },[rows])

    return (
        <div className="App">
            <div>
                <Container fluid>

                    {ShowBar && <SideBar />}
                    {(InstituteList.length >= 0  && LanguageList.length >=0 && UseCaseList.length >= 0) ? <div><SelectMenu />
                        <div><hr/></div>


                        <div style={{'text-align':'center'}}><h2>ANNOTATIONS OVERVIEW</h2></div>
                        <div style={{'margin-bottom':'2vh','text-align':'center'}}>In this section you can check how many documents have been annotated so far for each topic. You can also delete/download one or more documents.</div>

                        {(Cols.length>0 && defaultColumnWidths.length>0 && rows.length>0 && HiddenCols.length > 0) ? <div>
                        {/*{(rows.length>0) ? <div>*/}

                        <div><TableToShow columns={Cols} righe={rows} hiddenColumns={HiddenCols} default_width={defaultColumnWidths}/></div>
                        </div> : <div className='spinnerDiv'><Spinner animation="border" role="status"/></div>}






                    </div> : <div className='spinnerDiv'><Spinner animation="border" role="status"/></div>}
                </Container>
            </div>

        </div>



    );
}


export default ReportsStats;
