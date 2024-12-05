import React, { useState } from 'react';
import AccountBox from "./accountBox/index"
import "./styles.css";
import styled from "styled-components";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Home = () => {
 
  return (
  <AppContainer>
    <AccountBox />
  </AppContainer>
  );
};

export default Home;