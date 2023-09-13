import Button from "./Button"

const TaskDetails = () => {
  return (
    <div  style={{width: '75%'}}>
        <h1>Task Details</h1>
        <div style={{textAlign: 'left'}}>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed mauris felis, tristique non condimentum nec, blandit eu lectus. Praesent nec vehicula magna. Mauris auctor lectus vel ipsum sodales vehicula. Curabitur pulvinar ipsum vel lorem vulputate, sed dapibus leo pellentesque. Nunc sodales diam magna, id porta lectus porttitor ac. Duis arcu eros, maximus eu massa in, pulvinar finibus ligula. Pellentesque consequat augue vel metus fringilla, in viverra turpis feugiat. Nam vehicula tellus tellus.</p>

            <p>Curabitur non orci nulla. Integer ac elementum quam. Vestibulum ac odio ultricies, posuere ipsum eu, ultricies tortor. Nulla lobortis ex erat, et viverra quam finibus nec. Sed in mi vel nisl ullamcorper malesuada. Proin accumsan a est quis scelerisque. Nulla sem urna, luctus quis diam sed, maximus faucibus enim.</p>

            <p>Nullam at lorem eget neque vestibulum maximus. Proin rutrum vulputate nisi sed auctor. Etiam sit amet lectus nec risus egestas tincidunt mattis et sapien. Maecenas pulvinar neque at commodo fermentum. Nam tincidunt ipsum vitae metus hendrerit, vitae imperdiet nunc rhoncus. Pellentesque non ex lacus. Curabitur vel arcu enim. Nulla facilisi.</p>

            <p>Cras vehicula sodales nibh, quis gravida felis suscipit at. Maecenas sit amet congue nisl. Sed dolor erat, accumsan nec ante sed, cursus aliquam mi. Sed vel laoreet nulla. Nam scelerisque mi ligula, at mollis ligula elementum id. Phasellus posuere nisl massa, eget luctus orci porta in. Aliquam a lorem sit amet justo dignissim dictum ut consequat ante. Fusce tempor hendrerit nibh, in consequat dolor consequat feugiat.</p>

            <p>Duis neque erat, dignissim at sollicitudin quis, dapibus non turpis. Nullam imperdiet mi maximus magna rhoncus tincidunt. Aliquam interdum turpis vitae augue bibendum, vel facilisis libero vestibulum. Maecenas sit amet vehicula ante, in iaculis est. Suspendisse facilisis eget ante ut maximus. Morbi imperdiet dolor eget diam molestie tincidunt. Morbi at tortor quis enim facilisis aliquet id vel urna. Morbi elit diam, dictum sed nisi a, feugiat viverra tellus. Sed gravida eu augue in ullamcorper. Sed cursus quis nunc in venenatis. Vestibulum facilisis lectus nec feugiat viverra. Aliquam interdum nisl velit, mattis aliquet mauris pretium sit amet. Suspendisse quis purus sed tellus luctus elementum laoreet sed turpis. Phasellus fringilla urna id sapien scelerisque, nec malesuada orci accumsan. Duis vitae metus ac metus ultricies suscipit sit amet vel lacus. Donec ullamcorper quam ut nisl laoreet, vel viverra ante dictum.</p>     
        </div>

        <div>
          <Button text={'Approve'} className={'btn approve'}/>
          <Button text={'Reject'} className={'btn reject'}/>
        </div>
        
    </div>
  )
}

export default TaskDetails
