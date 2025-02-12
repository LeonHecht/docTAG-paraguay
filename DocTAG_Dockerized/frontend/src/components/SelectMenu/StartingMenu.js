import React, {useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {confirmable, createConfirmation} from 'react-confirm';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {
    faLink,
    faRobot,
    faMicroscope,
    faTimesCircle,
    faLanguage,
    faListOl,
    faStickyNote,
    faHospital,
    faUser, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {AppContext, LinkedContext} from "../../App";
import 'bootstrap/dist/css/bootstrap.min.css';
//import '../Linking/linked.css';
import Select from 'react-select';
import axios from "axios";
import Buttons from "../General/Buttons";
import {Container,Row,Col} from "react-bootstrap";


function StartingMenu(props){
    const { report_type,start,showOptions,username,annotation,action,reportString,institute,language,usecase,updateMenu,batchNumber,
        usecaseList,languageList,instituteList } = useContext(AppContext);
    const [UseCaseList,SetUseCaseList] = usecaseList;
    const [LanguageList,SetLanguageList] = languageList;
    const [InstituteList,SetInstituteList] = instituteList;
    const [UpdateMenu, SetUpdateMenu] = updateMenu;
    const [ShowModal, SetShowModal] = showOptions;
    const [Institute, SetInstitute] = institute;
    const [Language, SetLanguage] = language;
    const [UseCase, SetUseCase] = usecase;
    const [Action,SetAction] = action;
    const [repString,SetRepString] = reportString;
    const [Ins,SetIns] = useState('')
    const [Use,SetUse] = useState('')
    const [Lang,SetLang] = useState('')
    const [Anno, SetAnno] = useState('')
    const [Rep,SetRep] = useState('')
    const [Batch,SetBatch] = useState('')
    const [Annotation,SetAnnotation] = annotation
    const [ReportType,SetReportType] = report_type
    const [Start,SetStart] = start;
    const [BatchNumber,SetBatchNumber] = batchNumber
    const [BatchList,SetBatchList] = useState([])
    const [ShowErrorReports,SetShowErrorReports] = useState(false)
    // const [FieldsUseCasesToExtract,SetFieldsUseCasesToExtract] = useState(false)
    // const [FieldsAlreadyExtracted,SetFieldsAlreadyExtracted] = useState(false)
    const [PubMedPresence,SetPubMedPresence] = useState(false)
    const [ShowError,SetShowError] = useState(false)
    const [ShowModalAgent,setShowModalAgent] = useState(false)
    // const handleClose = () => SetShowModal(false);
    // const handleCloseAgent = () => setShowModalAgent(false);
    const [Options_usecases, Setoptions_usecases] = useState([])
    const [Options_language, Setoptions_language] = useState([])
    const [Options_institute, Setoptions_institute] = useState([])
    const [Options_batch, Setoptions_batch] = useState([])
    // const [agentPresence,setAgentPresence] = useState(0)
    // const [showSelectManual,setShowSelectManual] = useState(false)
    const [Options_annotation, SetOptions_annotation] = useState([])
    const [DocTAGPresence,SetDocTAGPresence] = useState(false)
    const [Username,SetUsername] = username;
    // const Options_annotation = ([{value: 'manual', label: 'Manual'},{value: 'Automatic', label: 'Automatic'}])


    useEffect(()=>{

        if(UseCaseList.length > 0 && InstituteList.length > 0 && LanguageList.length > 0){
            if(LanguageList.length === 1){
                SetLang(LanguageList[0])
            }
            // SetIns('default')
            SetAnno('Manual')
            var options_institute = []
            var options_language = []

            InstituteList.map((inst)=>{
                if (inst !== 'PUBMED'){
                    options_institute.push({value: inst, label: inst})

                }
            })
            LanguageList.map((lang)=>{
                options_language.push({value: lang, label: lang})
            })


            Setoptions_institute(options_institute)
            Setoptions_language(options_language)
        }

        axios.get('check_PUBMED_reports').then(function(response){
            if(response.data['count'] > 0){
                SetPubMedPresence(true)
            }
            else{
                SetPubMedPresence(false)

            }

        }).catch(function(error){
            console.log('error: ',error)
        })
        axios.get('check_doctag_reports').then(function(response){
            if(response.data['count'] > 0){
                SetDocTAGPresence(true)
            }
            else{
                SetDocTAGPresence(false)

            }

        }).catch(function(error){
            console.log('error: ',error)
        })

    },[UseCaseList,InstituteList,LanguageList])

    useEffect(()=>{
        var options_usecases = []
        if(Rep==='pubmed'){
            SetIns('PUBMED')
            SetLang('english')

            axios.get("pubmed_reports").then(response => {
                (response.data['usecase'].map(uc=>{
                    options_usecases.push({value: uc, label: uc})

                }));

            }).catch(function (error){console.log(error)})
        }
        else if(Rep==='reports'){
            if(LanguageList.length === 1){
                SetLang(LanguageList[0])
            }
            SetIns('default')
            axios.get("doctag_reports").then(response => {
                (response.data['usecase'].map(uc=>{
                    options_usecases.push({value: uc, label: uc})

                }));

            }).catch(function (error){console.log(error)})
        }
        Setoptions_usecases(options_usecases)

    },[Rep])

    useEffect(()=>{
        if(PubMedPresence === true && DocTAGPresence === false){
            SetRep('pubmed')
        }
        else if(PubMedPresence === false && DocTAGPresence === true){
            SetRep('reports')
        }

    },[PubMedPresence,DocTAGPresence])

    function onSave(e){

            if(Ins === '' || Lang === '' || Use === '' || Rep === '' || Batch === ''){
                SetShowError(true)

            }
            else { //Salvo solo se tutti e tre i campi sono stati riempiti
                var count = 0
                axios.get('get_reports', {
                    params: {
                        institute: Ins,
                        usec: Use,
                        lang: Lang,
                        batch: Batch

                    }
                }).then(function (response) {
                    count = response.data['count']

                    if (count === 0) {
                        SetShowErrorReports(true)
                    }
                    else if(count >0) {

                        SetShowModal(false)
                        SetShowErrorReports(false)


                        axios.post("new_credentials", {
                            usecase: Use, language: Lang, institute: Ins, report_type: Rep,batch:Batch
                        })
                            .then(function (response) {
                                SetUseCase(Use)
                                SetLanguage(Lang)
                                SetInstitute(Ins)
                                SetAnnotation(Anno)
                                SetReportType(Rep)
                                SetBatchNumber(Batch)
                                // sessionStorage.setItem('inst', Ins)
                                // sessionStorage.setItem('lang', Lang)
                                // sessionStorage.setItem('use', Use)
                                // SetIns('')
                                SetUse('')
                                SetLang('')
                                SetAnno('')
                                SetRep('')
                                SetBatch('')
                                //SetStart(false)
                                // console.log('ERROR', response);


                            })
                            .catch(function (error) {
                                // SetIns('')
                                // SetUse('')
                                // SetLang('')
                                console.log('ERROR', error);
                            });

                        // }

                    }
                })
                    .catch(function (error) {
                        SetUpdateMenu(true)
                        // SetIns('')
                        SetUse('')
                        SetLang('')
                        SetAnno('')
                        SetRep('')
                        SetBatch('')
                        console.log('ERROR', error);
                    });
                // console.log('count1234', count)

            }



    }


    function handleChangeLanguage(option){
        console.log(`Option selected:`, option.value);
        SetLang(option.value.toString())
    }

    function handleChangeUseCase(option){
        console.log(`Option selected:`, option.value);
        SetUse(option.value.toString())
    }

    function handleChangeInstitute(option){
        console.log(`Option selected:`, option.value);
        SetIns(option.value.toString())
    }
    function handleChangeMode(option){
        console.log(`Option selected:`, option.value);
        SetAnno(option.value.toString())

    }
    function handleChangeReportType(option){
        console.log(`Option selected:`, option.value);
        SetRep(option.value.toString())

    }
    function handleChangeBatch(option){
        console.log(`Option selected:`, option.value);
        SetBatch(option.value.toString())

    }

    // useEffect(()=>{
    //
    //     if(Use !== '' && Ins !== '' && Lang !== '' && Batch !== ''){
    //         axios.get('check_auto_presence_for_configuration',{params:{batch:Batch,report_type:Rep,usecase:Use,institute:Ins,language:Lang}})
    //             .then(response=>{
    //                 if(response.data['count']>0){
    //                     var arr = []
    //                     arr.push({value:'Manual',label:'Manual'})
    //                     arr.push({value:'Automatic',label:'Automatic'})
    //                     SetOptions_annotation(arr)
    //                 }
    //                 else{
    //                     var arr = []
    //                     arr.push({value:'Manual',label:'Manual'})
    //                     SetOptions_annotation(arr)
    //                 }
    //             })
    //
    //
    //     }
    //
    // },[Use,Ins,Lang,Batch])

    useEffect(()=>{
        if(Use !== ''){
            var opt = []
            if(Rep === 'reports') {

                axios.get('get_batch_list', {params: {usecase: Use}}).then(response => {
                    SetBatchList(response.data['batch_list'])
                    if (response.data['batch_list'].length === 1) {
                        SetBatch(1)
                    } else {
                        response.data['batch_list'].map(el => {
                            opt.push({value: el, label: el})
                        })
                    }

                })
            }
            if(Rep === 'pubmed'){
                axios.get('get_PUBMED_batch_list',{params:{usecase:Use}}).then(response=>{

                    SetBatchList(response.data['batch_list'])
                    if(response.data['batch_list'].length === 1){
                        SetBatch(1)
                    }
                    else{
                        response.data['batch_list'].map(el=>{
                            opt.push({value:el,label:el})
                        })
                    }})
            }

            Setoptions_batch(opt)



        }
    },[Use,Rep])

    return(
        <div>

        <Row>
            <Col md={8}></Col>
            <Col md={4} style={{'text-align':'right'}}>
                <span className='userInfo'><span > {Username} </span><FontAwesomeIcon icon={faUser} size='2x'/> <a href="logout" className="badge badge-secondary" >Logout <FontAwesomeIcon icon={faSignOutAlt}/></a></span>

            </Col>
        </Row>
        <div style={{'text-align':'center','margin-top':'20px'}}>
            <div><h4><span>Welcome </span><span style={{'color':'royalblue'}}>{Username}</span><span>!</span></h4>
                {/*Select a language, a use case and an institute before starting.*/}
            </div>
            {ShowError === true && <div style={{'font-size':'18px','color':'red'}}><FontAwesomeIcon icon={faTimesCircle}/> Please fill all the fields <FontAwesomeIcon icon={faTimesCircle}/></div>}
            {ShowErrorReports === true && <h5>There are not documents for this configuration, please change it. </h5>}

            <Row>
                <Col md={12}>
                    {PubMedPresence === true && DocTAGPresence === true && <div style={{'text-align': 'center', 'margin-top': '40px'}}>
                        <div><FontAwesomeIcon icon={faStickyNote}/> Document type</div>
                        <div style={{'margin-left': '20%', 'margin-right': '20%'}}><Select

                            className='selection'
                            onChange={(option) => handleChangeReportType(option)}
                            options={[{
                                    value: 'reports',
                                    label: 'DocTAG documents'
                                }, {value: 'pubmed', label: 'PUBMED articles'}]
                                }

                        />
                            <hr/>
                        </div>


                    </div>}
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <div style={{'text-align':'center'}}>
                        {Options_usecases !== [] && <>
                            <div> Topic</div>
                            <div style={{'margin-left':'20%','margin-right':'20%'}}><Select
                                className='selection'
                                onChange={(option)=>handleChangeUseCase(option)}
                                options={Options_usecases}
                            /><hr/></div></>}
                         </div>
                </Col></Row>
            {Use !== '' && BatchList.length > 1 && <Row>
                <Col md={12}>
                    <div style={{'text-align':'center'}}>
                        <>
                            <div> Batch number</div>
                            <div style={{'margin-left':'20%','margin-right':'20%'}}><Select
                                className='selection'
                                onChange={(option)=>handleChangeBatch(option)}
                                options={Options_batch}
                            /><hr/></div></>
                         </div>
                </Col>

            </Row>}
            {(Rep !== '' && LanguageList.length > 1 && (Rep === 'reports' || PubMedPresence === false)) && <Row>
                <Col md={12}>
                    <div style={{'text-align':'center'}}>

                        <div style={{'text-align':'center'}}>
                            <div> Language</div>
                            <div style={{'margin-left':'20%','margin-right':'20%'}}><Select

                                className='selection'
                                onChange={(option)=>handleChangeLanguage(option)}
                                options={Options_language}

                            /> <hr/>
                            </div>
                        </div></div>
                </Col>
            </Row>}
            {/*<Row>*/}
            {/*    <Col md={12}>*/}
            {/*        <div style={{'text-align':'center'}}>*/}
            {/*            {(Rep !== '' && (Rep === 'reports' || PubMedPresence === false)) &&*/}
            {/*            <div style={{'text-align':'center'}}>*/}
            {/*                <div><FontAwesomeIcon icon={faHospital} /> Institute</div>*/}
            {/*                <div style={{'margin-left':'20%','margin-right':'20%'}}>*/}
            {/*                    <Select*/}
            {/*                    className='selection'*/}
            {/*                    onChange={(option)=>handleChangeInstitute(option)}*/}
            {/*                    options={Options_institute}*/}

            {/*                /><hr/></div>*/}
            {/*            </div>}</div>*/}
            {/*    </Col>*/}
            {/*</Row>*/}
            {/*<Row>*/}
            {/*    <Col md={12}>*/}
            {/*        {Use !== '' && Options_annotation.length>0 && <div><div><FontAwesomeIcon icon={faRobot} /> Annotation mode</div>*/}
            {/*            <div style={{'margin-left':'20%','margin-right':'20%'}}><Select*/}
            {/*                className='selection'*/}
            {/*                onChange={(option)=>handleChangeMode(option)}*/}
            {/*                options={Options_annotation}*/}

            {/*            /></div><hr/>*/}
            {/*        </div>}*/}
            {/*    </Col>*/}
            {/*</Row>*/}



            <div style={{'margin-top':'40px'}}>
                <Button variant='primary' type='button' onClick={(e)=>onSave(e)}>Start</Button>
            </div>

        </div>
        </div>



    );



}


export default (StartingMenu);