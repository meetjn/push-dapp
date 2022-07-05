import React,{useEffect, useState,useCallback,useContext} from 'react';
import './intentBar.css';

import { Web3Provider } from "ethers/providers";
import { useWeb3React } from "@web3-react/core";

import SearchIcon from "@material-ui/icons/Search";

import CloseIcon from "@material-ui/icons/Close";
import IntentFeed from '../intentFeed/intentFeed';
import * as w2wChatHelper from '../../../../helpers/w2wChatHelper';
import { getIntents } from '../../../../helpers/w2wChatHelper';
import Web3 from 'web3';
import {Context, Feeds} from '../w2wIndex';

const IntentBar = () => {
    const { did } = useContext(Context);
    const { connector, chainId } = useWeb3React<Web3Provider>();
    const [wordEntered, setWordEntered] = useState<string>('');
    const [allUsers, setAllUsers] = useState([]);
    const [allIntents, setAllIntents] = useState([]);
    const [filteredUserData, setFilteredUserData] = useState<any>([]);
    
    const getAllUsers = useCallback(async () => {
        const users = await w2wChatHelper.getAllUsers();
        setAllUsers(users);
        console.log("printing users");
        console.table(users);
    }, []);

    const getAllIntents = useCallback(async() => {
        const responseData = await getIntents(did.id);
        setAllIntents(responseData);
        console.log("Printing intents");
        console.table(responseData);
    }, []);

    const getAllUserDatafromIntents = useCallback(async() => {
        var filteredUsers = [];
        allUsers.forEach(user => {
            allIntents.forEach(intent => {
                if (user.did == intent.intent_sent_by && intent.intent=='Pending') {
                    console.log("Found a valid intent");
                    filteredUsers.push(user);
                }
            });
        });
        // setFilteredUserData(filteredUsers);
    }, []);

    useEffect(() => {
        getAllUsers();
        getAllIntents();
        getAllUserDatafromIntents();
    }, []);

    const searchFromDb = (did: string) => {
        let filteredData = [];
        if (did.length) {
            filteredData = allUsers.filter(details => {
                return (
                    details.did.trim().includes(did.trim())
                )
            });
            if (filteredData.length) {
                setFilteredUserData(filteredData);
            }
            else {
                setFilteredUserData([]);
            }
        }
        else {
            setFilteredUserData([]);
            setWordEntered("");
        }
    }

    const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let searchAddress = event.target.value;
        setWordEntered(searchAddress);
    }

    const submitSearch = async (event) => {
        event.preventDefault();
        try {
            const provider = await connector.getProvider();
            var web3 = new Web3(provider);
            var ENS = web3.eth.ens;
            if (!web3.utils.isAddress(wordEntered)) {
                const address: string = await ENS.getAddress(wordEntered);
               // const did = await getLinkWallets(address);
                if (did === null) {
                    searchFromDb('');
                }
                else {
                //    searchFromDb(did);
                }
            }
            else {
              //  const did = await getLinkWallets(wordEntered);
                //searchFromDb(did);
            }
        }
        catch (err) {
            setFilteredUserData([]);
            console.log(err, "hello");
        }
    }

    const clearInput = () => {
        setFilteredUserData([]);
        setWordEntered("");
    };

    return (
        <div className="search" >
            <div className='intentFilter_buttons' style={{color:"black", width:"100%", fontSize:"20px"}}>
                <h1 style={{color:"black", fontSize:"medium"}}>Intents</h1>
            </div>
            
            <div className='sidebar_message'>
                {<IntentFeed filteredUserData={filteredUserData} />}
            </div>
        </div>
    );
};

export default IntentBar;