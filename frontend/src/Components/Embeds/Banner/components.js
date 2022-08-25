import styled from 'styled-components'

export const BannerProvider = styled.div`
  max-height: ${props => props.show ? '300px' : '0' };
  ${({ show }) => !show && `
    max-height: 0px !important;
    transition: max-height 0.5s ease-out !important;
  `}
  background-color: #0479a5;
  overflow: hidden;
  width: 100%;
  padding-right: 20px;
  transition: max-height 0.5s ease-in;
`

export const BannerImage = styled.img`
  height: 160px;
  margin: 20px;
  width: 160px;
  @media (max-width: 500px) {
    display: none;
  }
`

export const BannerTextBox = styled.div`
  padding-top: 20px;
  margin-right: 80px;
  padding-bottom: 5px;
  color: #dedede;
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
