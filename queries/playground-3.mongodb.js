// Select the database to use.
use('rnai');

// source_citations = db.getCollection('papers').find({
//   source: 'citations'
// }).count();

// source_references = db.getCollection('papers').find({
//     source: 'references'
//   }).count();

// source_manual = db.getCollection('papers').find({
//     source: 'manual'
//   }).count();

// Print a message to the output window.
// console.log(`Manually sourced papers: ${source_manual}`)
// console.log(`Citations sourced papers: ${source_citations}`)
// console.log(`References sourced papers: ${source_references}`)

// authors_depth_0 = db.getCollection('authors').find({
//   depth: 0
// }).count()

// console.log("authors_depth_0: ", authors_depth_0)

// authors_depth_1 = db.getCollection('authors').find({
//   depth: 1
// }).count()

// console.log("authors_depth_1: ", authors_depth_1)

// authors_depth_2 = db.getCollection('authors').find({
//   depth: 2
// }).count()

// console.log("authors_depth_2: ", authors_depth_2)

for (let i = 0; i < 3; i++){
  papers_depth_0 = db.getCollection('papers').find({
    depth: i,
    vertical_id: '655e1b515c18f2d17830a24b',
    source: "citations"
  }).count()
  
  console.log(`papers_depth_ ${i} : ${papers_depth_0}`)
}

console.log()

for (let i = 0; i < 3; i++){
  authors_depth_0 = db.getCollection('authors').find({
    depth: i,
    vertical_id: '655e1b515c18f2d17830a24b',
    // source: "citations"
  }).count()
  
  console.log(`authors_depth_ ${i} : ${authors_depth_0}`)
}

console.log()

let num_authors = 0;

db.getCollection('papers').find({
    vertical_id: '655e1b515c18f2d17830a24b',
    depth: 1
}).forEach(function(doc) {
    if (doc.authors && Array.isArray(doc.authors)) {
        num_authors += doc.authors.length;
    }
});

print("Total number of authors:", num_authors);
