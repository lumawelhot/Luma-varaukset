Feature: Customer functionality

#Scenario: As an customer I can book an event at least two weeks ahead
#  Given Customer is on the main page
#  When I navigate to desired events' booking form
#  And I enter necessary information
#  Then the event is booked

Scenario: As an customer I can cancel booked visit
  Given Customer is on the main page
  When I enter to correct visits' url
  And I click cancel button
  Then the visit is cancelled

#Scenario: As an customer I can filter events
#  Given Customer is on the main page
#  And customer has booked an event
#  When I click filter button
#  And I change filter options
#  And I enter to agenda view
#  Then correct events are shown