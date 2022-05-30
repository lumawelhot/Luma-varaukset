import styled from 'styled-components'

export const BannerProvider = styled.div`
  margin-top: ${props => props.show ? '0' : '-200px' };
  ${({ show }) => !show && `
    height: 0px !important;
    overflow: hidden;
  `}
  background-color: #0479a5;
  width: 100%;
  min-height: 200px;
  padding-right: 20px;
  padding-bottom: 20px;
  z-index: 10;
  transition: margin-top 0.5s linear;
  position: relative;
`

export const BannerImage = styled.img`
  height: 160px;
  margin: 20px;
  position: absolute;
  @media (max-width: 500px) {
    display: none;
  }
`

export const BannerTextBox = styled.div`
  margin-left: 220px;
  padding-top: 20px;
  margin-right: 80px;
  color: #dedede;
  ${({ show }) => !show && `
    visibility: hidden;
    display: none;
  `}
  @media (max-width: 500px) {
    margin-left: 20px;
  }
`

export const BannerTitle = styled.div`
  font-size: x-large;
  font-weight: bold;
`

export const BannerText = styled.span`
  font-size: large;
  @media (max-width: 1000px) {
    display: none;
  }
`

export const BannerLink = styled.a`
  color: #f1f1f1;
`