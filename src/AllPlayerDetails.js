import React, { useState }  from 'react';
import _ from 'lodash';
import Axios from'axios';
import { getJwtToken, getHeaderObject } from './util';
import Constants from './Constants';
import { Table ,Card, Button} from 'react-bootstrap';
import ReactDataGrid from 'react-data-grid';
// import { Toolbar, Data } from "react-data-grid-addons";
import './Grid.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

// const selectors = Data.Selectors;

class Toolbar extends React.Component{
    render(){
        return(<div><Button onClick={()=>this.props.onToggleFilter(this.abc)} style={{float:'right'}}>Filter</Button></div>)
    }
}

class AllPlayerDetails extends React.Component{
    constructor(props){
        super(props);

        this.state={
            players : [],
            dPlayers : [],
            sortedPlayers : [],
            filteredPlayers : [],
            filters : {}
        }

        this.columns = [
            { key: 'playerId', name: 'Player ID', sortable:true,filterable : true},
            { key: 'name', name: 'Player Name' ,sortable:true,filterable : true},
            { key : 'grade',name:'Grade',sortable:true,filterable :true},
            { key: 'team', name: 'IPL Team' ,sortable:true,filterable :true},
            { key: 'soldTo', name: 'Sold To' ,sortable:true,filterable : true} ,
            { key: 'nationality', name: 'Nationality' ,sortable:true,filterable : true} ,
            { key: 'soldAt', name: 'Price' ,sortable:true} 
        ]
    }

    componentDidMount(){
        this.getAllPlayerData();
    }
    
    getAllPlayerData(){
        Axios.get(Constants.BASE_URL + '/allPlayers',getHeaderObject()).then(
            (res)=>{
                this.setState({players:res.data,dPlayers:res.data})
            },(err)=>{
                if(err && err.response && err.response.data && err.response.data.message){
                    toast.error(err.response.data.message);
                  }
                console.error(err);
            }
        )
    }

    refreshDataHandler= ()=>{
        this.getAllPlayerData();
    }
    
    download (){
        try{
            const doc = new jsPDF();
            const filteredPlayers = this.getRows(this.state.dPlayers, this.state.filters);
            doc.autoTable({
                head: [['ID','Player Name','Team','Sold At','Sold To','Grade','Nationality','\r\n']],
                body:filteredPlayers.map(player=>
                    [
                        player.playerId,
                        player.name,
                        player.team,
                        player.soldAt,
                        player.soldTo,
                        player.grade,
                        player.nationality
                    ]
                )
            });
            doc.save('summary.pdf');
            var CsvString = "Player Id,Name,Team,Sold At,Sold To,Grade,Nationality,Bids\r\n";
            filteredPlayers.forEach(function(RowItem, RowIndex) {
                for(var key in RowItem){
                // RowItem.forEach(function(ColItem, ColIndex) {
                    CsvString += JSON.stringify(RowItem[key]).replace(/\,/g,'') + ',';
                }
                CsvString += "\r\n";
            });
            CsvString = "data:application/csv," + encodeURIComponent(CsvString);
            var x = document.createElement("A");
            x.setAttribute("href", CsvString );
            x.setAttribute("download","somedata.csv");
            document.body.appendChild(x);
            x.click();
        }
        catch(e){
            console.log(e);
        }
    }

    downloadAsExcell(){
        try{
            const filteredPlayers = this.getRows(this.state.dPlayers, this.state.filters);
            var CsvString = "Player Id,Name,Team,Sold At,Sold To,Grade,Nationality,Bids\r\n";
            filteredPlayers.forEach(function(RowItem) {
                for(var key in RowItem){
                    CsvString += JSON.stringify(RowItem[key]).replace(/\,/g,'') + ',';
                }
                CsvString += "\r\n";
            });
            CsvString = "data:application/csv," + encodeURIComponent(CsvString);
            var x = document.createElement("A");
            x.setAttribute("href", CsvString );
            x.setAttribute("download","auction2.csv");
            document.body.appendChild(x);
            x.click();
        }
        catch(e){
            console.log(e);
        }
    }

    setdPlayers(dPlayers){
        this.setState({dPlayers});
    }

    getRows(rows, filters) {
        var filteredRows = rows;
        Object.keys(filters).map(filterKey=>{
            const term = filters[filterKey].filterTerm;
            filteredRows = filteredRows.filter((value)=>{
                return value[filterKey] && (value[filterKey].toString().toLowerCase()).indexOf(term.toLowerCase())>-1
            });
        })
        return filteredRows;
    }

    sortRows = (initialRows, sortColumn, sortDirection) =>  {
        const comparer = (a, b) => { 
            if (sortDirection === "ASC") {
                return a[sortColumn] > b[sortColumn] ? 1 : -1;
            } else if (sortDirection === "DESC") {
                return a[sortColumn] < b[sortColumn] ? 1 : -1;
            }
        };
        
        return sortDirection === "NONE" ? initialRows : initialRows.sort(comparer);
    };

    handleFilterChange = filters => {
        // const newFilters = { ...filters };
        const oldFilter = this.state.filters;
        const key = filters.column.key;

        if (filters.filterTerm) {
          oldFilter[key] = filters;
        } else {
          delete oldFilter[key];
        }
        return oldFilter;
    };

    setFilters(filters){
        this.setState({filters});
    }

    render(){
        var players = this.state.players;
        const dPlayers = this.state.dPlayers;
        const filters = this.state.filters;
        const filteredRows = this.getRows(dPlayers, filters);
        if(players &&players.length>0){
            return(
                <div>
                    <h2 style={{display:'inline-block'}}>
                        All PLayers Data 
                    </h2>
                    &nbsp;
                    <Button variant={'info'} style={{float:'right'}} onClick={this.download.bind(this)}>
                        Download PDF
                    </Button>
                    &nbsp;<span style={{float:'right'}}>&nbsp;</span>
                    <Button variant={'info'} style={{float:'right'}} onClick={this.downloadAsExcell.bind(this)}>
                        Download Excell
                    </Button>
                    <span style={{float:'right'}}>&nbsp;</span>
                    <Button variant={'info'} style={{float:'right'}} onClick={this.refreshDataHandler.bind(this)}>
                        Refresh Data
                    </Button>
                    <ReactDataGrid
                        columns={this.columns}
                        rowGetter={i => filteredRows[i]}
                        rowsCount={filteredRows.length}
                        minHeight={500}
                        toolbar={<Toolbar/>}
                        onGridSort={(sortColumn, sortDirection) => this.setdPlayers(this.sortRows(players, sortColumn, sortDirection))}
                        onAddFilter={filter => this.setFilters(this.handleFilterChange(filter))}
                        onClearFilters={() => this.setFilters({})}
                    />
                </div>
            )
        }
        return null;
    }
}

export default AllPlayerDetails;

