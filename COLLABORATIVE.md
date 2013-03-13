Introduction

Requirements:
1. A single document is stored on a server.
2. Multiple users can edit the document simultaneously from their browser.
3. The edits made by each user updates the server copy
   and every other users copy in near real time. 
4. Conflicting edits between users are handled gracefully.
5. Periods where a users browser if offline (can't contact the server) are
   handled gracefully.
   
Assumptions:
1. The document is as a tree of elements / attributes, like XML. But can be 
   easily converted to and from json.
2. Every element & attribute in the document has a document unique id. 
   (Unique in the context of the document being edited).



Operation Transformation
0. Server "S" has a copy of a document "D" at version 1. (SDv1)
0. Client "A" has a copy of a document "D" at version 1. (ADv1)
0. Client "B" has a copy of a document "D" at version 1. (BDv1)
0. Client A applies an operation "Op1" to the local copy of their document ADv1 -> ADv2
0. Op1 is sent and applied to the server copy of the document Op1(SDv1) -> SDv2
0. Client B applies an operation "Op2" to the local copy of their document Op2(BDv1) -> BDv3
0. Op2 is sent to the server which notices it was originally applied to Dv1.
   So transforms the operation to be suitable for Dv2. OT(Op2, Dv1, Dv2) -> Op2'.
0. The transformed Op2' is applied to Dv2. Op2'(Dv2) -> SDv4.

and so on...



Differential Synchronization
See: http://neil.fraser.name/writing/sync/

KEY
a     Client A document
a'    Client A shadow document
A'    Client A shadow document on server
S     Master document on server
[@x]  A note as to which version any of the above documents are at.
Px-y  Patch from version x to version y if the document 
Func(args)  A function applied to a list of comma separated arguments 
x Func y    Same as Func(x,y)


=     assignment (from right to left)
->    gives (the result of a function or action)
=>    implies


Start with every copy at version 1 (@1)


1. Client A edits it's version of the document: 
   a[@1] -> a[@2]

2. The edits are turned into a patch: 
   a[@2] Diff a'[@1] -> P1-2
   
3. Client A shadow is updated to v2:
   a'[@1] = a[@v2] => a'[@2]
   
   Note this would give the same result and is symmetric to the next opperation
   P1-2 Patch a'[@1] -> a'[@2] 
   
4. Patch Pv1-2 is sent to the server and applied to the A shadow, which should never fail: 
   P1-2 Patch A'[@1] -> A'[@2]

5. Patch Pv1-2 is applied to the central server copy, on a best effort basis: 
   P1-2 Patch S[@3] -> S[@4]

   Note 1. To make this example more interesting we assume the server copy 
   has been changed by another client and is now at version 3.
   
   Note 2. A "fuzzer" can help ensure a patch designed for v1 can work on document v3.
   
   Note 3. An Operational Transform can also help make a patch designed for version 1 
   work on version 3. For example something like:
   OT(P1-2, "+2") -> P3-4
   
6. We now need to push the most recent changes to the central server copy "S" back out 
   to client A to reflect both the changes that brought about version 3 and a actual 
   result of P1-2 which were applied on a best effort basis so may not have 100% worked 
   as expected.
   
   S Diff A' -> P   //Symmetric to step 2 above.
   P Patch A'       //Symmetric to step 3 above.
   P Patch a'       //Symmetric to step 4 above.
   P Patch a        //Symmetric to step 5 above, with all the same Notes.
   
 7. And back again (in summary)
 
   a Diff a' -> P
   P Patch a'
   P Patch A'
   P Patch S
 



Source XMl

a     Client A document
a'    Client A shadow document
A'    Client A shadow document on server
S     Master document on server
[@x]  A note as to which version any of the above documents are at.
Px-y  Patch from version x to version y if the document 
Func(args)  A function applied to a list of comma separated arguments 
x Func y    Same as Func(x,y)


JsonML

svg
  g
    rect(x=1,y=2,width=10,height=10)
    
jsonML:

[['svg',
  

