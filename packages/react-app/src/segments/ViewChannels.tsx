import React from "react";
import styled, { css } from 'styled-components';
import Loader from 'react-loader-spinner'

import { useWeb3React } from '@web3-react/core'
import { addresses, abis } from "@project/contracts";
import EPNSCoreHelper from 'helpers/EPNSCoreHelper';
import { ethers } from "ethers";

import DisplayNotice from "components/DisplayNotice";
import ViewChannelItem from "components/ViewChannelItem";

import ChannelsDataStore, { ChannelEvents } from "singletons/ChannelsDataStore";
import UsersDataStore, { UserEvents } from "singletons/UsersDataStore";

// Create Header
function ViewChannels({ epnsReadProvider, epnsWriteProvide }) {
  const { account, library } = useWeb3React();

  const [loading, setLoading] = React.useState(true);
  const [channels, setChannels] = React.useState([]);
  const [user, setUser] = React.useState({});
  const [owner, setOwner] = React.useState({});

  React.useEffect(() => {
    fetchChannels();
  }, [account]);

  // to fetch channels
  const fetchChannels = async () => {
    // get and set user and owner first
    const user = await UsersDataStore.instance.getUserMetaAsync();
    setUser(user);

    const owner = await UsersDataStore.instance.getOwnerMetaAsync();
    setOwner(owner);

    // const channelsMeta = await EPNSCoreHelper.getChannelsMetaLatestToOldest(-1, -1, epnsReadProvider);
    const channelsMeta = await ChannelsDataStore.instance.getChannelsMetaAsync(-1, -1);

    // sort this again, this time with subscriber count
    // channelsMeta.sort((a, b) => {
    //   if (a.memberCount.toNumber() < b.memberCount.toNumber()) return -1;
    //   if (a.memberCount.toNumber() > b.memberCount.toNumber()) return 1;
    //   return 0;
    // });

    // Filter out channel

    setChannels(channelsMeta);
    setLoading(false);
  }

  return (
    <Container>
      {loading &&
        <ContainerInfo>
          <Loader
           type="Oval"
           color="#35c5f3"
           height={40}
           width={40}
          />
        </ContainerInfo>
      }

      {!loading && channels.length == 0 &&
        <ContainerInfo>
          <DisplayNotice
            title="That's weird, No Channels in EPNS... world is ending... right?"
            theme="primary"
          />
        </ContainerInfo>
      }

      {!loading && channels.length != 0 &&
        <Items id="scrollstyle-secondary">

          {Object.keys(channels).map(index => {
            const isOwner = (
              channels[index].addr === account ||
              (account === owner && channels[index].addr === "0x0000000000000000000000000000000000000000")
            );

            return (
              <ViewChannelItem
                key={channels[index].addr}
                channelObject={channels[index]}
                isOwner={isOwner}
                epnsReadProvider={epnsReadProvider}
                epnsWriteProvide={epnsWriteProvide}
              />
            );
          })}
        </Items>
      }
    </Container>
  );
}

// css styles
const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  font-weight: 200;
  align-content: center;
  align-items: center;
  justify-content: center;

  max-height: 80vh;
`

const ContainerInfo = styled.div`
  padding: 20px;
`

const Items = styled.div`
  display: block;
  align-self: stretch;
  padding: 10px 20px;
  overflow-y: scroll;
  background: #fafafa;
`

// Export Default
export default ViewChannels;