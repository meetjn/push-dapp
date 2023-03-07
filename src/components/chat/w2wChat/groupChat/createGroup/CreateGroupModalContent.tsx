// React + Web3 Essentials
import React, { useContext } from 'react';
import { useWeb3React } from '@web3-react/core';

// External Packages
import styled, { ThemeProvider, useTheme } from 'styled-components';
import { useClickAway } from 'react-use';
import { ethers } from 'ethers';
import * as PushAPI from '@pushprotocol/restapi';

// Internal Components
import { ModalInnerComponentType } from 'hooks/useModalBlur';
import { ReactComponent as Close } from 'assets/chat/group-chat/close.svg';
import { ReactComponent as Back } from 'assets/chat/arrowleft.svg';
import { GroupDetailsContent } from './GroupDetailsContent';
import { AddWalletContent } from './AddWalletContent';
import { ItemHV2, SpanV2 } from 'components/reusables/SharedStylingV2';
import { ChatUserContext } from '../../../../../contexts/ChatUserContext';
import { appConfig } from '../../../../../config';
import useToast from 'hooks/useToast';
import { MdCheckCircle, MdError } from 'react-icons/md';
import { AppContext, Feeds } from 'types/chat';
import { Context } from 'modules/chat/ChatModule';
import { fetchInbox, getUserWithDecryptedPvtKey } from 'helpers/w2w/user';
import { profilePicture } from 'config/W2WConfig';
import { useDeviceWidthCheck } from 'hooks';
import { device } from 'config/Globals';

export const CreateGroupModalContent = ({ onClose, onConfirm: createGroup, toastObject }: ModalInnerComponentType) => {
  const [createGroupState, setCreateGroupState] = React.useState<number>(1);
  const { setInbox }: AppContext = useContext<AppContext>(Context);
  const [groupNameData, setGroupNameData] = React.useState<string>('');
  const [groupDescriptionData, setGroupDescriptionData] = React.useState<string>('');
  const [groupImageData, setGroupImageData] = React.useState<string>(null);
  const [groupTypeObject, setGroupTypeObject] = React.useState<any>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [memberList, setMemberList] = React.useState<any>([]);
  const { connectedUser, setConnectedUser } = useContext(ChatUserContext);
  const { account } = useWeb3React<ethers.providers.Web3Provider>();
  const themes = useTheme();
  const createGroupToast = useToast();
  const isMobile = useDeviceWidthCheck(600);

  const handlePrevious = () => {
    setCreateGroupState(1);
  };

  const handleClose = () => onClose();

  // to close the modal upon a click on backdrop
  const containerRef = React.useRef(null);
  useClickAway(containerRef, () => handleClose());
  const handleCreateGroup = async (): Promise<any> => {
    const user = await getUserWithDecryptedPvtKey(connectedUser);

    if (memberList.length >= 2) {
      setIsLoading(true);
      try {
        const memberWalletList = memberList.map((member) => member.wallets);
        const createGroupRes = await PushAPI.chat.createGroup({
          groupName: groupNameData,
          groupDescription: groupDescriptionData,
          members: memberWalletList,
          groupImage: groupImageData ?? profilePicture,
          admins: [],
          isPublic: groupTypeObject.groupTypeData == 'public' ? true : false,
          account: account!,
          pgpPrivateKey: connectedUser?.privateKey !== '' ? connectedUser?.privateKey : user.privateKey,
          env: appConfig.appEnv,
        });
        if (typeof createGroupRes !== 'string') {
          const inboxes: Feeds[] = await fetchInbox(connectedUser);
          setInbox(inboxes);
          createGroupToast.showMessageToast({
            toastTitle: 'Success',
            toastMessage: 'Group created successfully',
            toastType: 'SUCCESS',
            getToastIcon: (size) => (
              <MdCheckCircle
                size={size}
                color="green"
              />
            ),
          });
          handleClose();
        } else {
          createGroupToast.showMessageToast({
            toastTitle: 'Error',
            toastMessage: createGroupRes,
            toastType: 'ERROR',
            getToastIcon: (size) => (
              <MdError
                size={size}
                color="red"
              />
            ),
          });
        }
      } catch (e) {
        console.error('Error in creating group', e.message);
        createGroupToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: e.message,
          toastType: 'ERROR',
          getToastIcon: (size) => (
            <MdError
              size={size}
              color="red"
            />
          ),
        });
      }
      setTimeout(() => {
        setIsLoading(false);
        setConnectedUser(user);
      }, 2000);
    } else {
      createGroupToast.showMessageToast({
        toastTitle: 'Error',
        toastMessage: 'Need atleast 3 members to create a group! Please retry!',
        toastType: 'ERROR',
        getToastIcon: (size) => (
          <MdError
            size={size}
            color="red"
          />
        ),
      });
    }
  };
  return (
    <ThemeProvider theme={themes}>
      <ModalContainer createGroupState={createGroupState}>
        <ItemHV2
          justifyContent={createGroupState == 2 ? 'space-between' : 'center'}
          align-items="center"
        >
          {createGroupState == 2 && (
            <Back
              onClick={handlePrevious}
              style={{ cursor: 'pointer' }}
            />
          )}
          <SpanV2
            fontWeight="500"
            fontSize="24px"
            color={themes.fontColor}
            flex="1"
          >
            Create Group
          </SpanV2>
          <Close
            onClick={() => handleClose()}
            style={{ cursor: 'pointer', position: 'absolute', right: isMobile ? createGroupState == 2?'0px':'20px' : '4px' }}
          />
        </ItemHV2>
        {createGroupState == 1 && (
          <GroupDetailsContent
            groupNameData={groupNameData}
            groupDescriptionData={groupDescriptionData}
            groupImageData={groupImageData}
            groupTypeObject={groupTypeObject}
            handleGroupNameData={setGroupNameData}
            handleGroupDescriptionData={setGroupDescriptionData}
            handleGroupImageData={setGroupImageData}
            handleGroupTypeObject={setGroupTypeObject}
            handleCreateGroupState={setCreateGroupState}
          />
        )}
        {createGroupState == 2 && (
          <AddWalletContent
            handleCreateGroup={handleCreateGroup}
            memberList={memberList}
            handleMemberList={setMemberList}
            isLoading={isLoading}
          />
        )}
      </ModalContainer>
    </ThemeProvider>
  );
};

const ModalContainer = styled.div`
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: 16px;
  background-color: ${(props) => props.background};
  padding: ${(props) => (props.createGroupState == 2 ? '32px 36px' : '32px 17px')};
  margin: 0px;
  overflow-y: auto;
  overflow-x: hidden;
  & > div::-webkit-scrollbar {
    width: 4px;
  }
  & > div::-webkit-scrollbar-thumb {
    background: #cf1c84;
    border-radius: 10px;
  }
  @media ${device.mobileL} {
    max-height: 80vh;
    min-width: 93vw;
    max-width: 95vw;
    padding: ${(props) => (props.createGroupState == 2 ? '32px 24px' : '32px 0px')};
  }
`;