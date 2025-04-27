# Vibepoll

- A website that shows real time poll results.
- The website should not use database.
- The website should be responsive.
- The website should be secure. Make sure that internals are not exposed to the public.
- The website should be deployable on vercel.
- The website is expected to handle 3000 concurrent users. Be efficient.

- There are 3 pages:
    - User voting page
    - real time poll results page
    - Admin poll creation page

About the poll:
- There will be at most 1 poll at a time.
- The poll creator can choose the poll duration (1, 2 and custom minutes)
- The poll creator can choose the poll options (infinite options)
- The voter does not need to sign up. They will be shown the current poll and their vote. The website has to track the voter IP to avoid multiple votes.

About the admin poll creation page:
- The admin can create a poll with a chosen duration and options.
- The admin can see the real time poll results.
- The admin can end the poll.
- The admin has to login to create a poll.

About the user voting page:
- The user can see the current activepoll and vote.
- The user can see the real time poll results.
- If the poll is not active, the website should show waiting screen.
- The website should display message if the user already voted on the current poll to avoid multiple votes.

About the real time poll results page:
- The page will show the poll results in real time.
- The page will show the poll options in a chart.
- Update the poll results every 1 second.
- Make the chart animated every time the poll results are updated.





