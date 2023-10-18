# RNAI Version 1.0.0

This document/wiki covers the documentation for the functionality of the RNAI content aggregation library built, the reference for the API endpoints deployed for web access of the RNAI library, as well as a refernce of the database schema for the resultiung data.

## Deploying the RNAI API and Backend

The current prototype deployment runs as a nohup entry, with the following command:

```bash
nohup python3 rnai_backend/main.py &
```

This process will be updated to run as a service in the future - with a VPC with private and public subnets and a direct integration to MongoDB via a private endpoint.

## RNAI Library

The RNAI library extracts and aggregate data from the Internet (in this iteration, exclusively from Google Scholar), and compiles a content library as a MongoDB database that can be dynamically acessed, modified, and/or enriched.

The following documentation captures the processes taken to described under topics for each component of the content library generated, as it relates to the process followed in the RNAI library to generate the content.

### Verticals

* The verticals RNAI processes essentially consists of a title provided from the admin/moderator being saved to the database, as curretnly there is little curating to the vertical record itself be done to the name of the vertical itself.

* The vertical creation procedure results in MongoDB assigning a unique ID to the vertical which is sued as a reference for records of papers created under this vertical.

* The subroutine for adding verticals is at the following [file](rnai_backend/rnai/verticals/add.py).

* The subroutine for ranking all paper records under a vertical is at this [file](rnai_backend/rnai/verticals/rank_papers.py).

* The functions in the [main](rnai_backend/rnai/main.py) RNAI library that are called relevant to verticals can be found at `initialise_vertical`, `populate_verticals`, and `rank_verticals`.

### Papers

Aggregating content for the papers is the core copmonent of the functionality of the current RNAI library.

* The starting point to building content for papers for a vertical are the initial set of paper titles provided in the vertical creation process submitted to the system.
* Using these, a first iteration is created by querying Google Scholar for the paper titles, and extracting the top citations.

* For each paper, the data gathered from Google Scholar are saved under the `rnai.bucket_papers` to reduce queries made to Gooogle Scholar to maximise efficiency.

* The citation retrieval parameters can be adjusted in real-time by dynamically updating the parameters in the database under the `rnai_deployment.cite_parameters`

* Records are created for each paper by referring to Google Scholar and gathering author details and citations of the papers, and based on the number of levels with regards to depth as configured under the previous steps, and the number of citations per paper for which papers are retrieved are used to complete the paper data exctracted under each level.

* The relevant subroutine for adding a paper for the collection of papers is at this [file](rnai_backend/rnai/papers/add.py).

* The relevant subrouine for extracting the citations dynamically for a given paper is at this [file](rnai_backend/rnai/papers/citations.py).

* The functions in the [main](rnai_backend/rnai/main.py) RNAI library that are called relevant to papers can be found at `create_buckets`, `process_papers`, and `rank_papers`.

### Authors

* After all the papers for verticals are extracted, author data is extracted from the paper data saved in the buckets collection and Google Schoalr records.

* The relvant subroutines for extracting author data are at this [file](rnai_backend/rnai/authors/author_ids.py) and [file](rnai_backend/rnai/authors/retrieve.py).

* The subroutine for ranking papers by relevance to the vertical is at this [file](rnai_backend/rnai/authors/rank.py).

* The functions in the [main](rnai_backend/rnai/main.py) RNAI library that are called relevant to authors can be found at `process_authors` and `populate_author_records`.

### Institutes

* Intitutes are extracted from the affiliation details within author record aggregation, under the function found [here](rnai_backend/rnai/authors/retrieve.py).

* The affiliation details found under authors are unstructured with regards to the role of researcher, research group and university/institute data, so Natural Language Processing functions are used to extract the institute data.

## RNAI Deployment API

All following endpoints require the parameter payload to be included in json format, in the body of the request with the key and value pairs as defined below.

### /tasks/initialise

#### Input JSON fields

* query - string - vertical name
* papers - list of strings - paper titles
* time - date time format - time of vertical creation initiation
* admin_id - string - admin user id

#### Output

* 200 Signal with initialisation successful

### /tasks/webmaster

No input parameters required.

#### Output

* List of dictionaries describing all verticals tasks in system

### /tasks/status

#### Input JSON fields

* admin_id - string - admin user id

#### Output 

* list of dictionaries for all verticals for a given admin

### /verticals/details

This endpoint returns a list of paper ids and title of a vertical given the vertical id.

#### Input JSON fields

* vertical_id - string - vertical id

#### Output

* List of [paper_id, paper_title] pairs

### /paper_content/by_vertical_id

This endpoint returns a list of papers of a specified length of items for a given vertical, with the list sorted in descending order of the score, representing the importance of a paper to the vertical.

#### Input JSON fields

* vertical_id - string - vertical id
* paper_count - integer - number of papers to return

### /paper_content/by_paper_id

This endpoint returns the full contents of a paper stored in the database given the paper id.

#### Input JSON fields

* paper_id - string - paper id

#### Output

* Dictionary of paper contents

## RNAI Database Schema

This section contains the general schema used in the RNAI genrated database records with accompanying descriptions, with an example

### Verticals

* _id - database scores as an ObjectID, but is used as string between the API and WebApp
* name - string - name of vertical
* admin_id - string - user id of admin who created the vertical
* _complete - internal flag to indicate vertical has been created
* status - status of vertical creation task
* _api_start_time - time of vertical creation task internally
* task_start_at - time of vertical creation task from user interface

```json
{"_id":{"$oid":"65145feb1be7e62bda1cd5bb"},"name":"Bio-inspired burrowing robots","admin_id":"WgBrnJjBN6WWsVe1bDjZ56eNhTc2","_complete":true,"status":"Complete","_api_start_time":{"$date":{"$numberLong":"1695834091564"}},"task_start_at":"27/09/2023, 21:28:12"}
```

### Papers

* _id - database scores as an ObjectID, but is used as string between the API and WebApp
* title - string - title of paper
* _vertical_id - string - vertical id of paper
* _complete - internal flag to indicate paper has been created
* _reviewed - internal flag to indicate paper has been reviewed
* _bucket_exists - internal variable to indicate raw data for paper has been saved to database
* _cites_complete - internal flag to indicate citations for paper has been extracted
* _cite_by_complete - internal flag to indicate papers that cite this paper has been extracted
* _authors_listed - internal flag to indicate authors for paper has been extracted
* _authors_complete - internal flag to indicate author record for paper has been populated
* _citations_listed - internal flag to indicate citations have had records created and compelted
* _level - integer - level of paper in the vertical creation cycle
* _citation_count - integer - number of citations for paper
* authors - list of object IDs for authors

```json
{"_id":{"$oid":"65145fec1be7e62bda1cd5bc"},"title":"Razor clam to RoboClam: burrowing drag reduction mechanisms and their robotic adaptation","_vertical_id":{"$oid":"65145feb1be7e62bda1cd5bb"},"_complete":true,"_reviewed":false,"_bucket_exists":true,"_cites_complete":true,"_cite_by_complete":true,"_authors_listed":true,"_authors_complete":true,"_citations_listed":true,"_level":{"$numberInt":"0"},"_citation_count":{"$numberInt":"88"},"_cites":[],"_cited_by":[],"_authors":[{"$oid":"652e82346180c0fec31cd329"},{"$oid":"652e82346180c0fec31cd32a"},{"$oid":"652e82346180c0fec31cd32b"}]}
```

### Authors

* _id - ObjectID - author id in database
* _ags_id - string - Google Scholar id for author
* _complete - internal flag to indicate author record has been created
* name - name of author
* affiliation_raw - string - raw affiliation data for author extracted from google scholar
* citation_count - integer - number of citations for author
* institute_id - ObjectID - ID for institute of author in the RNAI database
* institute_name - string - name of institute of author
* org_name - string - name of organisation of author (difference that it includes a research group and/or department if its present)
* role - string - role of author in institute

```json
{"_id":{"$oid":"652e82346180c0fec31cd329"},"_ags_id":"cdZRbz8AAAAJ","_complete":true,"affiliation_raw":"Associate Professor of Mechanical Engineering, MIT","citation_count":{"$numberInt":"1560"},"institute_id":{"$oid":"652e83dd8fcb76aedb63976d"},"institute_name":"MIT","name":"Amos Winter","org_name":"MIT","role":"Associate Professor of Mechanical Engineering","scholar_id":"cdZRbz8AAAAJ"}
```
### Institutes

This collection only currently includes the ID assigned to an instittue and the name extracted

```json
{"_id":{"$oid":"652e83dd8fcb76aedb63976d"},"name":"MIT"}
```