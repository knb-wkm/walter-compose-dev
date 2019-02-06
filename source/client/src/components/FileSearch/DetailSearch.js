import React, { Component } from "react";
import PropTypes from "prop-types";

import DatePicker from 'material-ui/DatePicker';
import TextField from "material-ui/TextField";
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import IconButton from "material-ui/IconButton";
import ContentRemoveCircleOutline from "material-ui/svg-icons/content/remove-circle-outline";
import AutoComplete from "material-ui/AutoComplete";

import { find, findIndex, has } from 'lodash';
import * as moment from 'moment';
import dateTimeFormatter from '../../helper/dateTimeFormatter'

class DetailSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.searchItems !== this.props.searchItems && this.state.items.length > 0){
      this.execSearch();
    }
  }

  execSearch = () => {
    const queryItems = this.state.items
          .filter( item => item.picked )
          .map( item => {
            const searchItem = find(this.props.searchItems, { _id: item._id, picked: true });
            return searchItem ? { ...searchItem, value: item.value } : null;
          })
          .filter( item => item ); // reject null

    this.props.actions.searchFileDetail(this.props.history, queryItems);
  };

  appendSearchValue = (item, searchValue) => {
    const _item = { ...item, value: searchValue };
    const alreadyExists = this.state.items
          .filter(item => item._id === _item._id).length > 0;

    if (alreadyExists) {
      const _items = this.state.items.map( item => {
        if(item.between){

          if( item._id === _item._id ){
            const _value = {
              lt: ( _item.value.lt === undefined ) ? item.value.lt : _item.value.lt,
              gt: ( _item.value.gt === undefined ) ? item.value.gt : _item.value.gt
            }
            _item.value = _value;
            return _item;
          }else{
            return item;
          }

        }else{
          return item._id === _item._id ? _item : item;
        }
    });

      this.setState({ items: _items });
    }
    else {
      this.setState({ items: [...this.state.items, _item ] });
    }
  }

  searchTextField = (item) => {
      return (
      <TextField
        onKeyPress={ e => {
          if (e.key === "Enter") {
            this.execSearch();
          }
        }}
        onChange={ (e,val) => this.appendSearchValue(item, val) }
        floatingLabelText={item.label}
        hintText={item.label}
        />
    );
  };

  searchAutoCompleteField = (item) => {
    let data_source;
    switch (item.name) {
      case "tag":
        data_source = this.props.tags.map(tag => tag.label );
        break;
      case "authorities":
        data_source = this.props.users.map(user => user.name);
        break;
      default:
        break;
    }

    return (
      <AutoComplete
        filter={ (searchText, key) => {
          if(searchText === '') return true
          return searchText !== '' && key.indexOf(searchText) !== -1
        }}
        onNewRequest={e =>{
          this.execSearch();
        }}
        onUpdateInput={(searchText, dataSource, params)=>{
          let value;
          switch (item.name) {
            case "tag":
              const tag = find(this.props.tags, { label:searchText });
              value = tag === undefined ? "" : tag._id;
              break;
            case "authorities":
              const user = find(this.props.users, { name:searchText });
              value = user === undefined ? "" : user._id;
              break;
            default:
              break;
          }
          if(value !== "") this.appendSearchValue(item, value);
        }}
        openOnFocus={true}
        dataSource={data_source}
        floatingLabelText={item.label}
        hintText={item.label}
        menuStyle={{
          maxHeight: '50vh',
          overflowY: 'auto',
        }}
      />
    );
  };

  searchBoolField = (item) => {
    const value = find(this.state.items, {_id: item._id } ) === undefined ? null : find(this.state.items, {_id: item._id } ).value;
    return (
      <SelectField
        value={value}
        floatingLabelText={item.label}
        hintText={item.label}
        onChange={ (e,val) =>{
          new Promise((resolve,reject)=>{
            this.appendSearchValue(item, val===0?true:false);
            resolve();
          }).then(() => {
            this.execSearch();
          })
        }}
      >
        <MenuItem value={true} primaryText="お気に入り" />
        <MenuItem value={false} primaryText="お気に入り以外" />
      </SelectField>
    );
  }

  searchDateField = (item) => {
    return (
      <DatePicker
        formatDate={ new dateTimeFormatter("ja").format }
        DateTimeFormat={ dateTimeFormatter }
        onChange={ (e, value) => {
          new Promise( (resolve, reject) => {
            const result = this.appendSearchValue(item, value);
            resolve(result);
          }).then( res => {
            this.execSearch();
          });
        }}
        floatingLabelText={item.label}
        hintText={item.label}
        autoOk={true}
        locale="ja"
        />
    );
  };

  searchBetweenDateField = (item) => {
    return (
      <div style={{ display:"flex" }} >
        <DatePicker
          formatDate={ new dateTimeFormatter("ja").format }
          DateTimeFormat={ dateTimeFormatter }
          onChange={ (e, value) => {
            new Promise( (resolve, reject) => {
              const result = this.appendSearchValue(item, { gt:value });
              resolve(result);
            }).then( res => {
              this.execSearch();
            });
          }}
          floatingLabelText={`${item.label}(より大きい)`}
          hintText={item.label}
          style={{paddingRight:48}}
          autoOk={true}
          locale={"ja"}
          />

        <DatePicker
          formatDate={ new dateTimeFormatter("ja").format }
          DateTimeFormat={ dateTimeFormatter }
          onChange={ (e, value) => {
            new Promise( (resolve, reject) => {
              const result = this.appendSearchValue(item, { lt:value });
              resolve(result);
            }).then( res => {
              this.execSearch();
            });
          }}
          floatingLabelText={`${item.label}(より小さい)`}
          hintText={item.label}
          autoOk={true}
          locale={"ja"}
          />
      </div>
    );
  };

  renderField = (item) => {
    switch (item.value_type) {
      case "Date":
        return  item.between ? this.searchBetweenDateField(item) : this.searchDateField(item);
      case "Select":
        return this.searchAutoCompleteField(item);
      case "Bool":
        return this.searchBoolField(item);
      case "String":
      default:
        return this.searchTextField(item);
    }
  };

  renderForm = (item, idx) => {
    return (
      <div key={idx} style={{display: item.picked ? "flex" :"none" }}>
        <IconButton
          style={{marginTop: 23}}
          onClick={() => this.props.actions.searchItemNotPick(item) } >
          <ContentRemoveCircleOutline />
        </IconButton>

        {this.renderField(item)}
      </div>
    );
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "row-reverse", flexWrap: "wrap" }}>
        {this.props.searchItems.map( (item, idx) => this.renderForm(item) )}
      </div>
    );
  }
}

export default DetailSearch;
